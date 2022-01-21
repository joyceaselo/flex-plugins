/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { useForm, FormProvider, SubmitErrorHandler, FieldValues } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';
import type { DefinitionVersion } from 'hrm-form-definitions';

import {
  Box,
  BottomButtonBar,
  BottomButtonBarHeight,
  Container,
  TwoColumnLayout,
  ColumnarBlock,
  StyledNextStepButton,
} from '../../styles/HrmStyles';
import { CaseActionLayout, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { namespace, connectedCaseBase, routingBase, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import { transformValues } from '../../services/ContactService';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import { deleteFile, getFileUploadUrl } from '../../services/ServerlessService';
import {
  createFormFromDefinition,
  createStateItem,
  disperseInputs,
  splitInHalf,
  splitAt,
} from '../common/forms/formGenerators';
import { CustomITask, StandaloneITask, Document as tDocument, DocumentEntry } from '../../types/types';
import { AppRoutesWithCase, NewCaseSubroutes } from '../../states/routing/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import { EditDocumentTemporaryCaseInfo } from '../../states/case/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type OwnProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
  route: AppRoutesWithCase['route'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddDocument: React.FC<Props> = ({
  task,
  counselor,
  onClickClose,
  connectedCaseState,
  route,
  definitionVersion,
  setConnectedCase,
  updateTempInfo,
  changeRoute,
}) => {
  const firstElementRef = useFocus();

  const { temporaryCaseInfo } = connectedCaseState;
  const { DocumentForm } = definitionVersion.caseForms;
  const { layoutVersion } = definitionVersion;

  const getTemporaryFormContent = (): tDocument | null => {
    switch (temporaryCaseInfo?.screen) {
      case NewCaseSubroutes.AddDocument:
        return temporaryCaseInfo.info;
      case NewCaseSubroutes.EditDocument:
        return (temporaryCaseInfo as EditDocumentTemporaryCaseInfo).info.document;
      default:
        return null;
    }
  };

  const getTemporaryIndex = (): number | null =>
    temporaryCaseInfo?.screen === NewCaseSubroutes.EditDocument ? temporaryCaseInfo.info.index : null;

  const isEditingExistingItem = (): boolean => temporaryCaseInfo?.screen === NewCaseSubroutes.EditDocument;

  const init = getTemporaryFormContent() ?? {};
  const [initialForm] = React.useState(init); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm({ shouldUnregister: false });

  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const document = methods.getValues();
      updateTempInfo({ screen: 'add-document', info: document }, task.taskSid);
    };

    /**
     * This function calls an HTTP PUT to upload the document
     * @param file Document
     * @param preSignedUrl URL
     * @param mimeType MIME Type
     */
    const uploadDocument = async (file: File, preSignedUrl: string, mimeType: string) => {
      const headers = new Headers();
      headers.append('Content-Type', mimeType);

      const options = {
        method: 'PUT',
        body: file,
        headers,
      };
      await fetch(preSignedUrl, options);
    };

    /**
     * This function uploads the file in two steps:
     * 1) Generates a preSingedUrl for uploading the document
     * 2) Calls the generated preSignedUrl
     *
     * It returns the file name at AWS
     */
    const onFileChange = async event => {
      const file = event.target.files[0];

      if (file.size > MAX_FILE_SIZE) {
        alert('File exceeds max size.');
        return '';
      }

      const mimeType = file.type;
      const response = await getFileUploadUrl(file.name, mimeType);
      await uploadDocument(file, response.uploadUrl, mimeType);

      return response.fileNameAtAws;
    };

    const onDeleteFile = async (fileName: string) => {
      await deleteFile(fileName);
    };

    const fileUploadCustomHandlers = {
      onFileChange,
      onDeleteFile,
    };

    const generatedForm = createFormFromDefinition(DocumentForm)([])(initialForm, firstElementRef)(
      updateCallBack,
      fileUploadCustomHandlers,
    );

    if (layoutVersion.case.documents.splitFormAt)
      return splitAt(layoutVersion.case.documents.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [
    DocumentForm,
    initialForm,
    firstElementRef,
    layoutVersion.case.documents.splitFormAt,
    methods,
    task.taskSid,
    updateTempInfo,
  ]);

  const saveDocument = async shouldStayInForm => {
    const temporaryDoc = getTemporaryFormContent();
    const index = getTemporaryIndex();
    if (!temporaryDoc) return;

    const { info, id } = connectedCaseState.connectedCase;
    const document = transformValues(DocumentForm)(temporaryDoc);
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const documentId = uuidV4();
    const newDocument = {
      id: documentId,
      document,
      createdAt,
      twilioWorkerId: workerSid,
    };
    const documents: DocumentEntry[] = [...(info?.documents ?? [])];
    if (typeof index === 'number') {
      documents[index] = newDocument;
    } else {
      documents.push(newDocument);
    }
    const newInfo = info ? { ...info, documents } : { documents };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, true);
    if (shouldStayInForm) {
      const blankForm = DocumentForm.reduce(createStateItem, {});
      methods.reset(blankForm); // Resets the form.
      updateTempInfo({ screen: 'add-document', info: {} }, task.taskSid);
      changeRoute({ route, subroute: 'add-document' }, task.taskSid);
    }
  };

  async function saveDocumentAndStay() {
    await saveDocument(true);
  }

  async function saveDocumentAndLeave() {
    await saveDocument(false);
    onClickClose();
  }
  const { strings } = getConfig();

  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(
    isEditingExistingItem() ? 'Case: Edit Document' : 'Case: Add Document',
    () => {
      window.alert(strings['Error-Form']);
    },
  );

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader
            titleTemplate={isEditingExistingItem() ? 'Case-EditDocument' : 'Case-AddDocument'}
            onClickClose={onClickClose}
            counselor={counselor}
          />
          <Container>
            <Box paddingBottom={`${BottomButtonBarHeight}px`}>
              <TwoColumnLayout>
                <ColumnarBlock>{l}</ColumnarBlock>
                <ColumnarBlock>{r}</ColumnarBlock>
              </TwoColumnLayout>
            </Box>
          </Container>{' '}
        </CaseActionFormContainer>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          {!isEditingExistingItem() && (
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="Case-AddDocumentScreen-SaveAndAddAnotherDocument"
                secondary
                roundCorners
                onClick={methods.handleSubmit(saveDocumentAndStay, onError)}
              >
                <Template code="BottomBar-SaveAndAddAnotherDocument" />
              </StyledNextStepButton>
            </Box>
          )}
          <StyledNextStepButton
            data-testid="Case-AddDocumentScreen-SaveDocument"
            roundCorners
            onClick={methods.handleSubmit(saveDocumentAndLeave, onError)}
          >
            <Template code="BottomBar-SaveDocument" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddDocument.displayName = 'AddDocument';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseInfo: CaseActions.updateCaseInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddDocument);
