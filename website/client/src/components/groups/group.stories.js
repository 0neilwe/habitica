/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import {
  createStory,
  groupBossQuestParticipating,
  groupCollectionQuestNotStarted, groupCollectionQuestPending,
} from '@/components/groups/group.stories.utils';

storiesOf('Group Components|Party/Quest States', module)
  .add('Not a Member', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-leader="false" :is-member="false"
                       class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {
          },
          purchased: {
          },
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Member/No Quest', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-leader="false" :is-member="true"
                       class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {
          },
          purchased: {
          },
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Leader/No Quest', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-leader="true" :is-member="true"
                       class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {
          },
          purchased: {
          },
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Quest Owner/Quest Not Started', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: groupCollectionQuestNotStarted,
      };
    },
    user: {
      data: {
        _id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Member/Quest Invite Pending', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-member="true"
                       class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: groupCollectionQuestPending,
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {
          quest: {
            RSVPNeeded: true,
          },
        },
      },
    },
    challengeOptions: {},
  }))
  .add('Collection Quest/Quest Owner Participating', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Collection Quest/Not Participating', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Boss Quest/Participating', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: groupBossQuestParticipating,
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Boss Quest/Rage Enabled', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Not a party', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="false" :is-member="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
      },
    },
    challengeOptions: {},
  }));
