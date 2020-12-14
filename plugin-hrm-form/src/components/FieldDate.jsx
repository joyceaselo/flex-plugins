import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { StyledInput, StyledLabel, ErrorText, TextField } from '../styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';
import { fieldType } from '../types';

class FieldDate extends Component {
  static displayName = 'FieldDate';

  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    keepDateFormat: PropTypes.bool,
    placeholder: PropTypes.string,
    field: fieldType.isRequired,
    rows: PropTypes.number,
    handleBlur: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleFocus: PropTypes.func.isRequired,
  };

  static defaultProps = {
    placeholder: '',
    rows: null,
    label: '',
    keepDateFormat: false,
  };

  state = {
    isFocused: false,
    type: 'date',
    keepDateFormat: this.props.keepDateFormat,
  };

  handleFocus = event => {
    this.setState({ isFocused: true });
    this.props.handleFocus(event);
  };

  handleBlur = event => {
    if (!this.state.keepDateFormat) {
      this.setState({ type: 'text', isFocused: false });
      this.props.handleBlur(event);
    }
  };

  handleMouseEnter = () => this.setState({ type: 'date' });

  handleMouseLeave = () => !this.state.isFocused && !this.state.keepDateFormat && this.setState({ type: 'text' });

  render() {
    const { id, label, placeholder, field, rows, handleBlur, handleChange, handleFocus, ...rest } = this.props;
    const { type } = this.state;

    return (
      <TextField {...rest}>
        {label && (
          <StyledLabel htmlFor={id}>
            {label}
            <RequiredAsterisk field={field} />
          </StyledLabel>
        )}
        <StyledInput
          id={id}
          placeholder={placeholder}
          error={field.error !== null}
          value={field.value}
          multiline={Boolean(rows)}
          rows={rows}
          type={type}
          onChange={handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          color="#CDCDCD"
        />
        {field.error && <ErrorText>{field.error}</ErrorText>}
      </TextField>
    );
  }
}

export default FieldDate;
