import React from 'react';
import renderer from 'react-test-renderer';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Template } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../mockStyled';
import '../mockGetConfig';
import CallTypeButtons from '../../components/callTypeButtons';
import { DataCallTypeButton, NonDataCallTypeButton, ConfirmButton, CancelButton } from '../../styles/callTypeButtons';
import LocalizationContext from '../../contexts/LocalizationContext';
import callTypes from '../../states/DomainConstants';
import { namespace, contactFormsBase } from '../../states';
import { changeRoute } from '../../states/routing/actions';
import { updateCallType } from '../../states/contacts/actions';

jest.mock('../../services/ContactService', () => ({
  saveToHrm: jest.fn(),
}));

const mockStore = configureMockStore([]);

const task = {
  taskSid: 'task-sid',
  attributes: {},
};

const strings = {
  TaskHeaderEndCall: 'HANG UP',
  TaskHeaderEndChat: 'END CHAT',
};

const withEndCall = <Template code="TaskHeaderEndCall" />;
const withEndChat = <Template code="TaskHeaderEndChat" />;

jest.mock('../../services/ContactService', () => ({
  saveToHrm: () => Promise.resolve(),
}));

afterEach(() => {
  jest.resetAllMocks();
});

test('<CallTypeButtons> inital render (no dialog)', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        tasks: {
          [task.taskSid]: {
            callType: '',
          },
        },
      },
    },
  };
  const store = mockStore(initialState);

  const isCallTask = () => false;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} dispatch={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  ).root;

  expect(() => component.findByType(CloseTaskDialogText)).toThrow();
  expect(() => component.findAllByType(DataCallTypeButton)).not.toThrow();
  expect(() => component.findAllByType(NonDataCallTypeButton)).not.toThrow();
});

const getConfirmButtonText = component => component.findByType(ConfirmButton).props.children;

test('<CallTypeButtons> renders dialog with END CHAT button', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        tasks: {
          [task.taskSid]: {
            callType: callTypes.child,
          },
        },
      },
    },
  };
  const store = mockStore(initialState);

  const isCallTask = () => false;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} dispatch={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText.props).toStrictEqual(withEndChat.props);
  expect(confirmButtonText.type).toStrictEqual(withEndChat.type);
});

test('<CallTypeButtons> renders dialog with HANG UP button', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        tasks: {
          [task.taskSid]: {
            callType: callTypes.child,
          },
        },
      },
    },
  };
  const store = mockStore(initialState);

  const isCallTask = () => true;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} dispatch={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText.props).toStrictEqual(withEndCall.props);
  expect(confirmButtonText.type).toStrictEqual(withEndCall.type);
});

test('<CallTypeButtons> click on CallType button', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        tasks: {
          [task.taskSid]: {
            callType: callTypes.child,
          },
        },
      },
    },
  };
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  const isCallTask = () => false;

  render(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  );

  expect(screen.getByText('CallType-child')).toBeInTheDocument();
  screen.getByText('CallType-child').click();

  expect(store.dispatch).toHaveBeenCalledWith(updateCallType(task.taskSid, callTypes.child));
  expect(store.dispatch).toHaveBeenCalledWith(
    changeRoute({ route: 'tabbed-forms', subroute: 'childInformation' }, task.taskSid),
  );
});

test('<CallTypeButtons> click on END CHAT button', async () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        tasks: {
          [task.taskSid]: {
            callType: callTypes.blank,
          },
        },
      },
    },
  };
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  const isCallTask = () => false;

  const handleCompleteTask = jest.fn();

  render(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  );

  expect(screen.getByText('TaskHeaderEndChat')).toBeInTheDocument();
  screen.getByText('TaskHeaderEndChat').click();

  waitFor(() => expect(handleCompleteTask).toHaveBeenCalledWith(task.taskSid, task));
});

test('<CallTypeButtons> click on CANCEL button', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        tasks: {
          [task.taskSid]: {
            callType: '',
          },
        },
      },
    },
  };
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  const isCallTask = () => false;

  const handleCompleteTask = jest.fn();

  render(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  );

  expect(screen.getByText('CancelButton')).toBeInTheDocument();
  screen.getByText('CancelButton').click();

  waitFor(() => expect(handleCompleteTask).not.toHaveBeenCalledWith(task.taskSid, task));
});
