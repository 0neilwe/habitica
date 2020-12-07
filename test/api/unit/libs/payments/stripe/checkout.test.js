import stripeModule from 'stripe';
import nconf from 'nconf';
import common from '../../../../../../website/common';
import * as subscriptions from '../../../../../../website/server/libs/payments/stripe/subscriptions';
import * as oneTimePayments from '../../../../../../website/server/libs/payments/stripe/oneTimePayments';
import {
  createCheckoutSession,
  createEditCardCheckoutSession,
} from '../../../../../../website/server/libs/payments/stripe/checkout';
import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import { model as Group } from '../../../../../../website/server/models/group';
import payments from '../../../../../../website/server/libs/payments/payments';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';

const { i18n } = common;

describe('Stripe - Checkout', () => {
  const stripe = stripeModule('test', {
    apiVersion: '2020-08-27',
  });
  const BASE_URL = nconf.get('BASE_URL');
  const redirectUrls = {
    success_url: `${BASE_URL}/redirect/stripe-success-checkout`,
    cancel_url: `${BASE_URL}/redirect/stripe-error-checkout`,
  };

  describe('createCheckoutSession', () => {
    let user;
    const sessionId = 'session-id';

    beforeEach(() => {
      user = new User();
      sandbox.stub(stripe.checkout.sessions, 'create').returns(sessionId);
    });

    it('gems', async () => {
      const amount = 999;
      const gemsBlockKey = '21gems';
      sandbox.stub(oneTimePayments, 'getOneTimePaymentInfo').returns({
        amount,
        gemsBlock: common.content.gems[gemsBlockKey],
      });

      const res = await createCheckoutSession({ user, gemsBlock: gemsBlockKey }, stripe);
      expect(res).to.equal(sessionId);

      const metadata = {
        type: 'gems',
        userId: user._id,
        gift: undefined,
        sub: undefined,
        gemsBlock: gemsBlockKey,
      };

      expect(oneTimePayments.getOneTimePaymentInfo).to.be.calledOnce;
      expect(oneTimePayments.getOneTimePaymentInfo).to.be.calledWith(gemsBlockKey, undefined, user);
      expect(stripe.checkout.sessions.create).to.be.calledOnce;
      expect(stripe.checkout.sessions.create).to.be.calledWith({
        payment_method_types: ['card'],
        metadata,
        line_items: [{
          price_data: {
            product_data: {
              name: JSON.stringify(metadata, null, 4),
            },
            unit_amount: amount,
            currency: 'usd',
          },
          quantity: 1,
        }],
        mode: 'payment',
        ...redirectUrls,
      });
    });

    it('gems gift', async () => {
      const receivingUser = new User();
      await receivingUser.save();

      const gift = {
        type: 'gems',
        uuid: receivingUser._id,
        gems: {
          amount: 4,
        },
      };
      const amount = 100;
      sandbox.stub(oneTimePayments, 'getOneTimePaymentInfo').returns({
        amount,
        gemsBlock: null,
      });

      const res = await createCheckoutSession({ user, gift }, stripe);
      expect(res).to.equal(sessionId);

      const metadata = {
        type: 'gift-gems',
        userId: user._id,
        gift: JSON.stringify(gift),
        sub: undefined,
        gemsBlock: undefined,
      };

      expect(oneTimePayments.getOneTimePaymentInfo).to.be.calledOnce;
      expect(oneTimePayments.getOneTimePaymentInfo).to.be.calledWith(undefined, gift, user);
      expect(stripe.checkout.sessions.create).to.be.calledOnce;
      expect(stripe.checkout.sessions.create).to.be.calledWith({
        payment_method_types: ['card'],
        metadata,
        line_items: [{
          price_data: {
            product_data: {
              name: JSON.stringify(metadata, null, 4),
            },
            unit_amount: amount,
            currency: 'usd',
          },
          quantity: 1,
        }],
        mode: 'payment',
        ...redirectUrls,
      });
    });

    it('subscription gift', async () => {
      const receivingUser = new User();
      await receivingUser.save();

      const gift = {
        type: 'subscription',
        uuid: receivingUser._id,
        subscription: {
          key: 'basic_3mo',
        },
      };
      const amount = 1500;
      sandbox.stub(oneTimePayments, 'getOneTimePaymentInfo').returns({
        amount,
        gemsBlock: null,
      });

      const res = await createCheckoutSession({ user, gift }, stripe);
      expect(res).to.equal(sessionId);

      const metadata = {
        type: 'gift-sub',
        userId: user._id,
        gift: JSON.stringify(gift),
        sub: undefined,
        gemsBlock: undefined,
      };

      expect(oneTimePayments.getOneTimePaymentInfo).to.be.calledOnce;
      expect(oneTimePayments.getOneTimePaymentInfo).to.be.calledWith(undefined, gift, user);
      expect(stripe.checkout.sessions.create).to.be.calledOnce;
      expect(stripe.checkout.sessions.create).to.be.calledWith({
        payment_method_types: ['card'],
        metadata,
        line_items: [{
          price_data: {
            product_data: {
              name: JSON.stringify(metadata, null, 4),
            },
            unit_amount: amount,
            currency: 'usd',
          },
          quantity: 1,
        }],
        mode: 'payment',
        ...redirectUrls,
      });
    });

    it('subscription', async () => {
      const subKey = 'basic_3mo';
      const coupon = null;
      sandbox.stub(subscriptions, 'checkSubData').returns(undefined);
      const sub = common.content.subscriptionBlocks[subKey];

      const res = await createCheckoutSession({ user, sub, coupon }, stripe);
      expect(res).to.equal(sessionId);

      const metadata = {
        type: 'subscription',
        userId: user._id,
        gift: undefined,
        sub: JSON.stringify(sub),
      };

      expect(subscriptions.checkSubData).to.be.calledOnce;
      expect(subscriptions.checkSubData).to.be.calledWith(sub, false, coupon);
      expect(stripe.checkout.sessions.create).to.be.calledOnce;
      expect(stripe.checkout.sessions.create).to.be.calledWith({
        payment_method_types: ['card'],
        metadata,
        line_items: [{
          price: sub.key,
          quantity: 1,
          // @TODO proper copy
        }],
        mode: 'subscription',
        ...redirectUrls,
      });
    });

    it('throws if group does not exists', async () => {
      const groupId = 'invalid';
      sandbox.stub(Group.prototype, 'getMemberCount').resolves(4);

      const subKey = 'group_monthly';
      const coupon = null;
      const sub = common.content.subscriptionBlocks[subKey];

      await expect(createCheckoutSession({
        user, sub, coupon, groupId,
      }, stripe))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 404,
          name: 'NotFound',
          message: i18n.t('groupNotFound'),
        });
    });

    it('group plan', async () => {
      const group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      const groupId = group._id;
      await group.save();
      sandbox.stub(Group.prototype, 'getMemberCount').resolves(4);

      // Add user to group
      user.guilds.push(groupId);
      await user.save();

      const subKey = 'group_monthly';
      const coupon = null;
      sandbox.stub(subscriptions, 'checkSubData').returns(undefined);
      const sub = common.content.subscriptionBlocks[subKey];

      const res = await createCheckoutSession({
        user, sub, coupon, groupId,
      }, stripe);
      expect(res).to.equal(sessionId);

      const metadata = {
        type: 'subscription',
        userId: user._id,
        gift: undefined,
        sub: JSON.stringify(sub),
        groupId,
      };

      expect(Group.prototype.getMemberCount).to.be.calledOnce;
      expect(subscriptions.checkSubData).to.be.calledOnce;
      expect(subscriptions.checkSubData).to.be.calledWith(sub, true, coupon);
      expect(stripe.checkout.sessions.create).to.be.calledOnce;
      expect(stripe.checkout.sessions.create).to.be.calledWith({
        payment_method_types: ['card'],
        metadata,
        line_items: [{
          price: sub.key,
          quantity: 6,
          // @TODO proper copy
        }],
        mode: 'subscription',
        ...redirectUrls,
      });
    });

    // no gift, sub or gem payment
    it('throws if type is invalid', async () => {
      await expect(createCheckoutSession({ user }, stripe))
        .to.eventually.be.rejected;
    });
  });

  describe('createEditCardCheckoutSession', () => {
    it('throws if customer does not exists');
    it('throws if subscription does not exists');
    it('change card for user subscription');
    it('throws if group does not exists');
    it('throws if user is not allowed to change group plan');
    it('change card for group plans - leader');
    it('change card for group plans - plan owner');
  });
});
