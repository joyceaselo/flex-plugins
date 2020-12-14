/* eslint-disable camelcase */
import { saveInsightsData } from '../../services/InsightsService';

test('saveInsightsData for non-data callType', async () => {
  const previousAttributes = {
    taskSid: 'task-sid',
    channelType: 'sms',
    conversations: {
      content: 'content',
    },
  };

  const twilioTask = {
    attributes: previousAttributes,
    setAttributes: jest.fn(),
  };

  const task = {
    callType: 'Abusive',
  };

  await saveInsightsData(twilioTask, task);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    channelType: 'sms',
    conversations: {
      content: 'content',
      conversation_attribute_2: 'Abusive',
      communication_channel: 'SMS',
    },
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
});

test('saveInsightsData for data callType', async () => {
  const previousAttributes = {
    taskSid: 'task-sid',
    channelType: 'voice',
    conversations: {
      content: 'content',
    },
  };

  const twilioTask = {
    attributes: previousAttributes,
    setAttributes: jest.fn(),
  };

  const task = {
    callType: 'Child calling about self',

    childInformation: {
      age: '13-15',
      gender: 'Boy',
    },
    caseInformation: {},
    categories: ['Unspecified/Other - Missing children', 'Bullying', 'Addictive behaviours'],
  };

  await saveInsightsData(twilioTask, task);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    channelType: 'voice',
    conversations: {
      content: 'content',
      conversation_attribute_1: 'Unspecified/Other - Missing children;Bullying;Addictive behaviours',
      conversation_attribute_2: 'Child calling about self',
      conversation_attribute_3: 'Boy',
      conversation_attribute_4: '13-15',
      communication_channel: 'Call',
    },
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
});
