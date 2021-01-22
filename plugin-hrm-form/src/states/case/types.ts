import type * as t from '../../types/types';
import { NewCaseSubroutes } from '../routing/types';
import { channelsAndDefault } from '../DomainConstants';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const REMOVE_CONNECTED_CASE = 'REMOVE_CONNECTED_CASE';
export const UPDATE_CASE_INFO = 'UPDATE_CASE_INFO';
export const UPDATE_TEMP_INFO = 'UPDATE_TEMP_INFO';
export const UPDATE_CASE_STATUS = 'UPDATE_CASE_STATUS';
export const MARK_CASE_AS_UPDATED = 'MARK_CASE_AS_UPDATED';

export type ViewNote = {
  note: string;
  counselor: string;
  date: string;
};

export type ViewContact = {
  contact?: any; // TODO: create Contact type
  detailsExpanded: { [section: string]: boolean };
  createdAt: string;
  timeOfContact: string;
  counselor: string;
};

export type ViewReferral = {
  referral: t.ReferralEntry;
  counselor: string;
  date: string;
};

export type TemporaryCaseInfo =
  | { screen: typeof NewCaseSubroutes.AddNote; info: t.Note }
  | { screen: typeof NewCaseSubroutes.AddReferral; info: t.Referral }
  | { screen: typeof NewCaseSubroutes.AddHousehold; info: t.Household }
  | { screen: typeof NewCaseSubroutes.AddPerpetrator; info: t.Perpetrator }
  | { screen: typeof NewCaseSubroutes.AddIncident; info: t.Incident }
  | { screen: typeof NewCaseSubroutes.ViewContact; info: ViewContact }
  | { screen: typeof NewCaseSubroutes.ViewNote; info: t.NoteEntry }
  | { screen: typeof NewCaseSubroutes.ViewHousehold; info: t.HouseholdEntry }
  | { screen: typeof NewCaseSubroutes.ViewPerpetrator; info: t.PerpetratorEntry }
  | { screen: typeof NewCaseSubroutes.ViewIncident; info: t.IncidentEntry }
  | { screen: typeof NewCaseSubroutes.ViewReferral; info: t.ReferralEntry };

type SetConnectedCaseAction = {
  type: typeof SET_CONNECTED_CASE;
  connectedCase: t.Case;
  taskId: string;
  caseHasBeenEdited: Boolean;
};

type RemoveConnectedCaseAction = {
  type: typeof REMOVE_CONNECTED_CASE;
  taskId: string;
};

type UpdateCaseInfoAction = {
  type: typeof UPDATE_CASE_INFO;
  info: t.CaseInfo;
  taskId: string;
};

type TemporaryCaseInfoAction = {
  type: typeof UPDATE_TEMP_INFO;
  value: TemporaryCaseInfo;
  taskId: string;
};

type UpdateCasesStatusAction = {
  type: typeof UPDATE_CASE_STATUS;
  status: t.CaseStatus;
  taskId: string;
};

type MarkCaseAsUpdated = {
  type: typeof MARK_CASE_AS_UPDATED;
  taskId: string;
};

export type CaseActionType =
  | SetConnectedCaseAction
  | RemoveConnectedCaseAction
  | UpdateCaseInfoAction
  | TemporaryCaseInfoAction
  | UpdateCasesStatusAction
  | MarkCaseAsUpdated;

export type ActivityType = {
  type: typeof channelsAndDefault[keyof typeof channelsAndDefault] | 'note' | 'referral';
};
