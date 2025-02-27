/* eslint-disable import/no-unused-modules */
import { ITask } from '@twilio/flex-ui';
import { DefinitionVersionId, CallTypes } from 'hrm-form-definitions';

export type EntryInfo = { createdAt: string; twilioWorkerId: string };

/*
 * export type ReferralEntry = {
 *   date: string;
 *   referredTo: string;
 *   comments: string;
 * };
 */

export type CaseItemFormValues = { [key: string]: string | boolean };

export type CaseItemEntry = { form: CaseItemFormValues; id: string | undefined } & EntryInfo;

export type Household = { [key: string]: string | boolean };

export type HouseholdEntry = { household: Household } & EntryInfo;

export type Perpetrator = { [key: string]: string | boolean };

export type PerpetratorEntry = { perpetrator: Perpetrator } & EntryInfo;

export type Incident = { [key: string]: string | boolean };

export type IncidentEntry = { incident: Incident } & EntryInfo;

export type Note = { [key: string]: string | boolean };

export type NoteEntry = { note: string; counselor: string; date: string };

export type Referral = { [key: string]: string | boolean };

export type ReferralEntry = { [key: string]: string | boolean };

export type Document = { [key: string]: string | boolean };

export type DocumentEntry = { document: Document; id: string | undefined } & EntryInfo;

export type CSAMReportEntry = { csamReportId: string; id: number } & EntryInfo;

export const blankReferral = {
  date: null,
  referredTo: null,
  comments: null,
};

export type CaseInfo = {
  definitionVersion?: DefinitionVersionId;
  offlineContactCreator?: string;
  summary?: string;
  notes?: string[];
  perpetrators?: PerpetratorEntry[];
  households?: HouseholdEntry[];
  referrals?: ReferralEntry[];
  incidents?: IncidentEntry[];
  documents?: DocumentEntry[];
  followUpDate?: string;
  childIsAtRisk?: boolean;
};

export type Case = {
  id: number;
  status: string;
  helpline: string;
  twilioWorkerId: string;
  info?: CaseInfo;
  createdAt: string;
  updatedAt: string;
  connectedContacts: any[]; // TODO: create contact type
};

type NestedInformation = { name: { firstName: string; lastName: string } };
export type InformationObject = NestedInformation & {
  [key: string]: string | boolean | NestedInformation[keyof NestedInformation]; // having NestedInformation[keyof NestedInformation] makes type looser here because of this https://github.com/microsoft/TypeScript/issues/17867. Possible/future solution https://github.com/microsoft/TypeScript/pull/29317
};

// Information about a single contact, as expected from DB (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type ContactRawJson = {
  definitionVersion?: DefinitionVersionId;
  callType: CallTypes | '';
  childInformation: InformationObject;
  callerInformation: InformationObject;
  caseInformation: { categories: {} } & { [key: string]: string | boolean | {} }; // // having {} makes type looser here because of this https://github.com/microsoft/TypeScript/issues/17867. Possible/future solution https://github.com/microsoft/TypeScript/pull/29317
  contactlessTask: { [key: string]: string | boolean };
};

// Information about a single contact, as expected from search contacts endpoint (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type SearchContact = {
  contactId: string;
  overview: {
    dateTime: string;
    name: string;
    customerNumber: string;
    callType: string;
    categories: {};
    counselor: string;
    notes: string;
    channel: string;
    conversationDuration: number;
  };
  details: ContactRawJson;
  csamReports: CSAMReportEntry[];
};

export type SearchContactResult = {
  count: number;
  contacts: SearchContact[];
};

export type SearchCaseResult = {
  count: number;
  cases: Case[];
};

/**
 * Custom tasks
 */
export const offlineContactTaskSid = 'offline-contact-task-sid';
export type OfflineContactTask = {
  taskSid: typeof offlineContactTaskSid;
  attributes: {
    isContactlessTask: true;
    channelType: 'default';
    helplineToSave?: string;
  };
  channelType: 'default';
};

export const standaloneTaskSid = 'standalone-task-sid';

export type StandaloneITask = {
  taskSid: typeof standaloneTaskSid;
  attributes: {
    isContactlessTask: boolean;
  };
};

export type InMyBehalfITask = ITask & { attributes: { isContactlessTask: true; isInMyBehalf: true } };

export type CustomITask = ITask | OfflineContactTask | InMyBehalfITask;

export function isOfflineContactTask(task: CustomITask): task is OfflineContactTask {
  return task.taskSid === offlineContactTaskSid;
}

/**
 * Checks if the task is issued by someone else to avoid showing certain things in the UI. This is done by checking isInMyBehalf task attribute (attached while creating offline contacts)
 */
export function isInMyBehalfITask(task: CustomITask): task is InMyBehalfITask {
  return task.attributes && task.attributes.isContactlessTask && (task.attributes as any).isInMyBehalf;
}

export function isTwilioTask(task: CustomITask): task is ITask {
  return task && !isOfflineContactTask(task) && !isInMyBehalfITask(task);
}

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === standaloneTaskSid;
};
