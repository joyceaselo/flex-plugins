/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/no-multi-comp */
/* eslint-disable import/no-unused-modules */
/* eslint-disable react/display-name */
import React, { useCallback } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { get, pick } from 'lodash';
import { Template } from '@twilio/flex-ui';
import { FormItemDefinition, FormDefinition, InputOption, SelectOption, MixedOrBool } from 'hrm-form-definitions';

import {
  Box,
  ColumnarBlock,
  TwoColumnLayout,
  FormLabel,
  DependentSelectLabel,
  FormError,
  Row,
  FormInput,
  FormDateInput,
  FormTimeInput,
  FormCheckBoxWrapper,
  FormCheckbox,
  FormMixedCheckbox,
  FormSelect,
  FormOption,
  FormSelectWrapper,
  FormTextArea,
  FormRadioInput,
  FormFieldset,
} from '../../../styles/HrmStyles';
import type { HTMLElementRef } from './types';
import UploadIcon from '../icons/UploadIcon';
import UploadFileInput from './UploadFileInput';

/**
 * Utility functions to create initial state from definition
 * @param {FormItemDefinition} def Definition for a single input of a Form
 */
export const getInitialValue = (def: FormItemDefinition) => {
  switch (def.type) {
    case 'input':
    case 'numeric-input':
    case 'email':
    case 'textarea':
    case 'file-upload':
      return '';
    case 'date-input': {
      if (def.initializeWithCurrent) {
        const date = new Date();
        // Return the YYYY-MM-DD part of the ISO string (from new Date to fix timezone differences)
        return new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`).toISOString().slice(0, 10);
      }

      return '';
    }
    case 'time-input': {
      if (def.initializeWithCurrent) {
        const date = new Date();
        // Return the locale hh:mm
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }

      return '';
    }
    case 'radio-input':
      return def.defaultOption ?? '';
    case 'select':
      return def.defaultOption ? def.defaultOption : def.options[0].value;
    case 'dependent-select':
      return def.defaultOption.value;
    case 'checkbox':
      return Boolean(def.initialChecked);
    case 'mixed-checkbox':
      return def.initialChecked === undefined ? 'mixed' : def.initialChecked;
    default:
      return null;
  }
};

/**
 * Adds a new property to the given object, with the name of the given form item definition, and initial value will depend on it
 * @param obj the object to which add a property related to the provided form item definition
 * @param def the provided form item definition
 */
export const createStateItem = <T extends {}>(obj: T, def: FormItemDefinition) => ({
  ...obj,
  [def.name]: getInitialValue(def),
});

export const ConnectForm: React.FC<{
  children: <P extends ReturnType<typeof useFormContext>>(args: P) => JSX.Element;
}> = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};

const RequiredAsterisk = () => (
  <span aria-hidden style={{ color: 'red' }}>
    *
  </span>
);

const getRules = (field: FormItemDefinition): RegisterOptions =>
  pick(field, ['max', 'maxLength', 'min', 'minLength', 'pattern', 'required', 'validate']);

const bindCreateSelectOptions = (path: string) => (o: SelectOption) => (
  <FormOption key={`${path}-${o.label}-${o.value}`} value={o.value} isEmptyValue={o.value === ''}>
    {o.label}
  </FormOption>
);

/**
 * Creates a Form with each input connected to RHF's wrapping Context, based on the definition.
 * @param {string[]} parents Array of parents. Allows you to easily create nested form fields. https://react-hook-form.com/api#register.
 * @param {() => void} updateCallback Callback called to update form state. When is the callback called is specified in the input type.
 * @param {FormItemDefinition} def Definition for a single input.
 */
export const getInputType = (parents: string[], updateCallback: () => void, customHandlers?: CustomHandlers) => (
  def: FormItemDefinition,
) => (
  initialValue: any, // TODO: restrict this type
  htmlElRef?: HTMLElementRef,
) => {
  const rules = getRules(def);
  const path = [...parents, def.name].join('.');

  const labelTextComponent = <Template code={`${def.label}`} className=".fullstory-unmask" />;

  switch (def.type) {
    case 'input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={innerRef => {
                    if (htmlElRef) {
                      htmlElRef.current = innerRef;
                    }

                    register(rules)(innerRef);
                  }}
                  defaultValue={initialValue}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'numeric-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={innerRef => {
                    if (htmlElRef) {
                      htmlElRef.current = innerRef;
                    }

                    register({
                      ...rules,
                      pattern: { value: /^[0-9]+$/g, message: 'This field only accepts numeric input.' },
                    })(innerRef);
                  }}
                  defaultValue={initialValue}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'email':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={innerRef => {
                    if (htmlElRef) {
                      htmlElRef.current = innerRef;
                    }

                    register({
                      ...rules,
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Entered value does not match email format' },
                    })(innerRef);
                  }}
                  defaultValue={initialValue}
                  type="email"
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'radio-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register, setValue, watch }) => {
            const [isMounted, setIsMounted] = React.useState(false); // value to avoid setting the default in the first render.

            React.useEffect(() => {
              if (isMounted && def.defaultOption) setValue(path, def.defaultOption);
              else setIsMounted(true);
            }, [isMounted, setValue]);

            const error = get(errors, path);
            const currentValue = watch(path);

            return (
              <FormFieldset error={Boolean(error)} aria-invalid={Boolean(error)} aria-describedby={`${path}-error`}>
                {def.label && (
                  <Row>
                    <Box marginBottom="8px">
                      {labelTextComponent}
                      {rules.required && <RequiredAsterisk />}
                    </Box>
                  </Row>
                )}
                {def.options.map(({ value, label }, index) => (
                  <Box key={`${path}-${value}`} marginBottom="15px">
                    <FormLabel htmlFor={`${path}-${value}`}>
                      <Row>
                        <FormRadioInput
                          id={`${path}-${value}`}
                          data-testid={`${path}-${value}`}
                          name={path}
                          type="radio"
                          value={value}
                          onChange={updateCallback}
                          innerRef={innerRef => {
                            // If autofocus is pertinent, focus first radio input
                            if (index === 0 && htmlElRef) {
                              htmlElRef.current = innerRef;
                            }

                            register(rules)(innerRef);
                          }}
                          checked={currentValue === value}
                        />
                        <Template code={label} className=".fullstory-unmask" />
                      </Row>
                    </FormLabel>
                  </Box>
                ))}
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormFieldset>
            );
          }}
        </ConnectForm>
      );
    case 'select':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            const createSelectOptions = bindCreateSelectOptions(path);

            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormSelectWrapper>
                  <FormSelect
                    id={path}
                    data-testid={path}
                    name={path}
                    error={Boolean(error)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${path}-error`}
                    onBlur={updateCallback}
                    innerRef={innerRef => {
                      if (htmlElRef) {
                        htmlElRef.current = innerRef;
                      }

                      register(rules)(innerRef);
                    }}
                    defaultValue={initialValue}
                  >
                    {def.options.map(createSelectOptions)}
                  </FormSelect>
                </FormSelectWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'dependent-select':
      return (
        <ConnectForm key={path}>
          {({ errors, register, watch, setValue }) => {
            const isMounted = React.useRef(false); // mutable value to avoid reseting the state in the first render. This preserves the "intialValue" provided
            const prevDependeeValue = React.useRef(undefined); // mutable value to store previous dependeeValue

            const dependeePath = [...parents, def.dependsOn].join('.');
            const dependeeValue = watch(dependeePath);

            React.useEffect(() => {
              if (isMounted.current && prevDependeeValue.current && dependeeValue !== prevDependeeValue.current) {
                setValue(path, def.defaultOption.value, { shouldValidate: true });
              } else isMounted.current = true;

              prevDependeeValue.current = dependeeValue;
            }, [setValue, dependeeValue]);

            const error = get(errors, path);
            const hasOptions = Boolean(dependeeValue && def.options[dependeeValue]);
            const shouldInitialize = initialValue && !isMounted.current;

            const validate = (data: any) =>
              hasOptions && def.required && data === def.defaultOption.value ? 'RequiredFieldError' : null;

            // eslint-disable-next-line no-nested-ternary
            const options: SelectOption[] = hasOptions
              ? [def.defaultOption, ...def.options[dependeeValue]]
              : shouldInitialize
              ? [def.defaultOption, { label: initialValue, value: initialValue }]
              : [def.defaultOption];

            const disabled = !hasOptions && !shouldInitialize;

            const createSelectOptions = bindCreateSelectOptions(path);

            return (
              <DependentSelectLabel htmlFor={path} disabled={disabled}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {hasOptions && rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormSelectWrapper>
                  <FormSelect
                    id={path}
                    data-testid={path}
                    name={path}
                    error={Boolean(error)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${path}-error`}
                    onBlur={updateCallback}
                    innerRef={innerRef => {
                      if (htmlElRef) {
                        htmlElRef.current = innerRef;
                      }

                      register({ validate })(innerRef);
                    }}
                    disabled={disabled}
                    defaultValue={initialValue}
                  >
                    {options.map(createSelectOptions)}
                  </FormSelect>
                </FormSelectWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </DependentSelectLabel>
            );
          }}
        </ConnectForm>
      );
    case 'checkbox':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <FormCheckBoxWrapper error={Boolean(error)}>
                  <Box marginRight="5px">
                    <FormCheckbox
                      id={path}
                      data-testid={path}
                      name={path}
                      type="checkbox"
                      aria-invalid={Boolean(error)}
                      aria-describedby={`${path}-error`}
                      onChange={updateCallback}
                      innerRef={innerRef => {
                        if (htmlElRef) {
                          htmlElRef.current = innerRef;
                        }

                        register(rules)(innerRef);
                      }}
                      defaultChecked={initialValue}
                    />
                  </Box>
                  {labelTextComponent}
                  {rules.required && <RequiredAsterisk />}
                </FormCheckBoxWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'mixed-checkbox':
      return (
        <ConnectForm key={path}>
          {({ errors, register, setValue }) => {
            React.useEffect(() => {
              register(path, rules);
            }, [register]);

            const initialChecked =
              initialValue === undefined || typeof initialValue !== 'boolean' ? 'mixed' : initialValue;
            const [checked, setChecked] = React.useState<MixedOrBool>(initialChecked);

            React.useEffect(() => {
              setValue(path, checked);
            }, [checked, setValue]);

            const error = get(errors, path);

            return (
              <FormLabel htmlFor={path}>
                <FormCheckBoxWrapper error={Boolean(error)}>
                  <Box marginRight="5px">
                    <FormMixedCheckbox
                      id={path}
                      data-testid={path}
                      type="checkbox"
                      className="mixed-checkbox"
                      aria-invalid={Boolean(error)}
                      aria-checked={checked}
                      aria-describedby={`${path}-error`}
                      onBlur={updateCallback}
                      onChange={() => {
                        if (checked === 'mixed') setChecked(true);
                        if (checked === true) setChecked(false);
                        if (checked === false) setChecked('mixed');
                      }}
                      innerRef={innerRef => {
                        if (htmlElRef) {
                          htmlElRef.current = innerRef;
                        }
                      }}
                    />
                  </Box>
                  {labelTextComponent}
                  {rules.required && <RequiredAsterisk />}
                </FormCheckBoxWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'textarea':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormTextArea
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={innerRef => {
                    if (htmlElRef) {
                      htmlElRef.current = innerRef;
                    }

                    register(rules)(innerRef);
                  }}
                  rows={def.rows ? def.rows : 10}
                  width={def.width}
                  defaultValue={initialValue}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'time-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormTimeInput
                  type="time"
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={innerRef => {
                    if (htmlElRef) {
                      htmlElRef.current = innerRef;
                    }

                    register(rules)(innerRef);
                  }}
                  defaultValue={initialValue}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'date-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormDateInput
                  type="date"
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={innerRef => {
                    if (htmlElRef) {
                      htmlElRef.current = innerRef;
                    }

                    register(rules)(innerRef);
                  }}
                  defaultValue={initialValue}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'file-upload':
      return (
        <ConnectForm key={path}>
          {({ errors, clearErrors, register, setValue, watch }) => (
            <UploadFileInput
              errors={errors}
              clearErrors={clearErrors}
              register={register}
              setValue={setValue}
              watch={watch}
              rules={rules}
              path={path}
              label={labelTextComponent}
              description={def.description}
              onFileChange={customHandlers.onFileChange}
              onDeleteFile={customHandlers.onDeleteFile}
              updateCallback={updateCallback}
              RequiredAsterisk={RequiredAsterisk}
              initialValue={initialValue}
              htmlElRef={htmlElRef}
            />
          )}
        </ConnectForm>
      );
    default:
      return null;
  }
};

type FileUploadCustomHandlers = {
  onFileChange: (event: any) => Promise<string>;
  onDeleteFile: (fileName: string) => Promise<void>;
};

export type CustomHandlers = FileUploadCustomHandlers;

/**
 * Creates a Form with each input connected to RHF's wrapping Context, based on the definition.
 * @param {FormDefinition} definition Form definition (schema).
 * @param {string[]} parents Array of parents. Allows you to easily create nested form fields. https://react-hook-form.com/api#register.
 * @param {() => void} updateCallback Callback called to update form state. When is the callback called is specified in the input type (getInputType).
 */
export const createFormFromDefinition = (definition: FormDefinition) => (parents: string[]) => (
  initialValues: any,
  firstElementRef: HTMLElementRef,
) => (updateCallback: () => void, customHandlers?: CustomHandlers): JSX.Element[] => {
  const bindGetInputType = getInputType(parents, updateCallback, customHandlers);

  return definition.map((e: FormItemDefinition, index: number) => {
    const elementRef = index === 0 ? firstElementRef : null;
    const maybeValue = get(initialValues, e.name);
    const initialValue = maybeValue === undefined ? getInitialValue(e) : maybeValue;
    return bindGetInputType(e)(initialValue, elementRef);
  });
};

export const addMargin = (margin: number) => (i: JSX.Element) => (
  <Box key={`${i.key}-wrapping-box`} marginTop={`${margin.toString()}px`} marginBottom={`${margin.toString()}px`}>
    {i}
  </Box>
);

export const disperseInputs = (margin: number) => (formItems: JSX.Element[]) => formItems.map(addMargin(margin));

export const splitInHalf = (formItems: JSX.Element[]) => {
  const m = Math.ceil(formItems.length / 2);

  const [l, r] = [formItems.slice(0, m), formItems.slice(m)];

  return [l, r];
};

export const splitAt = (n: number) => (formItems: JSX.Element[]) => [formItems.slice(0, n), formItems.slice(n)];

export const buildTwoColumnFormLayout = (formItems: JSX.Element[]) => {
  const items = disperseInputs(5)(formItems);

  const [l, r] = splitInHalf(items);

  return (
    <TwoColumnLayout>
      <ColumnarBlock>{l}</ColumnarBlock>
      <ColumnarBlock>{r}</ColumnarBlock>
    </TwoColumnLayout>
  );
};
