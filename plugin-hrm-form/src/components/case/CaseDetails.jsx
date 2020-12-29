/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-empty-function */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import CaseTags from '../search/CasePreview/CaseTags';
import CaseDetailsHeader from './caseDetails/CaseDetailsHeader';
import {
  DetailsContainer,
  DetailDescription,
  StyledInputField,
  StyledSelectField,
  StyledSelectWrapper,
} from '../../styles/case';
import { FormOption } from '../../styles/HrmStyles';

const statusOptions = [
  { label: 'Open', value: 'open', color: 'green' },
  { label: 'Closed', value: 'closed', color: 'red' },
];

const CaseDetails = ({
  caseId,
  name,
  categories,
  counselor,
  openedDate,
  lastUpdatedDate,
  followUpDate,
  status,
  handleInfoChange,
  handleStatusChange,
}) => {
  const lastUpdatedClosedDate = openedDate === lastUpdatedDate ? '—' : lastUpdatedDate;

  const initialColor = (statusOptions.find(x => x.value === status) || {}).color || '#000000';

  const [color, setColor] = useState(initialColor);

  const onStatusChange = selectedOption => {
    setColor(statusOptions.find(x => x.value === selectedOption).color);
    handleStatusChange(selectedOption);
  };

  return (
    <>
      <CaseDetailsHeader caseId={caseId} childName={name} />
      <DetailsContainer tabIndex={0} aria-labelledby="Case-CaseId-label">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsDateOpened">
                <Template code="Case-CaseDetailsDateOpened" />
              </label>
            </DetailDescription>
            <StyledInputField
              disabled
              id="Details_DateOpened"
              value={openedDate}
              aria-labelledby="CaseDetailsDateOpened"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsLastUpdated">
                <Template code="Case-CaseDetailsLastUpdated" />
              </label>
            </DetailDescription>
            <StyledInputField
              disabled
              id="Details_DateLastUpdated"
              value={lastUpdatedClosedDate}
              aria-labelledby="CaseDetailsLastUpdated"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsFollowUpDate">
                <Template code="Case-CaseDetailsFollowUpDate" />
              </label>
            </DetailDescription>
            <StyledInputField
              type="date"
              id="Details_DateFollowUp"
              name="Details_DateFollowUp"
              value={followUpDate}
              onChange={e => handleInfoChange('followUpDate', e.target.value)}
              aria-labelledby="CaseDetailsFollowUpDate"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsStatusLabel">
                <Template code="Case-CaseDetailsStatusLabel" />
              </label>
            </DetailDescription>
            <StyledSelectWrapper>
              <StyledSelectField
                id="Details_CaseStatus"
                name="Details_CaseStatus"
                aria-labelledby="CaseDetailsStatusLabel"
                onChange={e => onStatusChange(e.target.value)}
                defaultValue={status}
                color={color}
              >
                {statusOptions.map(o => (
                  <FormOption key={o.value} value={o.value} style={{ color: '#000000' }}>
                    {o.label}
                  </FormOption>
                ))}
              </StyledSelectField>
            </StyledSelectWrapper>
          </div>
        </div>
        <div style={{ paddingTop: '15px' }}>
          <CaseTags categories={categories} />
        </div>
      </DetailsContainer>
    </>
  );
};

CaseDetails.displayName = 'CaseDetails';
CaseDetails.propTypes = {
  caseId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  counselor: PropTypes.string.isRequired,
  openedDate: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  followUpDate: PropTypes.string,
  lastUpdatedDate: PropTypes.string,
  handleInfoChange: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
};

CaseDetails.defaultProps = {
  followUpDate: '',
  lastUpdatedDate: '',
};

export default CaseDetails;
