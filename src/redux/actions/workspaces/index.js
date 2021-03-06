import {
  INSTRUMENT_WORKSPACE,
  EDITOR_WORKSPACE,
} from '../../../types/workspace'


export const WORKSPACE_UPDATED = 'WORKSPACE_UPDATED'

export const updateWorkspace = workspace => dispatch =>
  dispatch({
    type: WORKSPACE_UPDATED,
    payload: {
      workspace,
    }
  })

export const openInstrumentWorkspace = () => dispatch =>
  dispatch(updateWorkspace(INSTRUMENT_WORKSPACE))

export const openEditorWorkspace = () => dispatch =>
  dispatch(updateWorkspace(EDITOR_WORKSPACE))

export const PROJECT_DRAWER_TOGGLED = 'PROJECT_DRAWER_TOGGLED'

export const toggleProjectDrawer = () => dispatch =>
  dispatch({
    type: PROJECT_DRAWER_TOGGLED,
  })
