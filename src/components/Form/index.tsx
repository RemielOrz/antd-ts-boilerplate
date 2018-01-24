import WebForm, { WebFormComponent } from './Form';
import SearchForm from './SearchForm';
import StoreForm, { mapPropsToFields, onFieldsChange} from './StoreForm';
const create = WebForm.create;
export {
  WebForm,
  SearchForm,
  StoreForm,
  mapPropsToFields,
  onFieldsChange,
  create,
  WebFormComponent,
};
export default WebForm;
