import { Field } from 'formik';

const labelStyle = {
  marginBottom: 20,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
};

const errorStyle = {
  color: 'red',
  fontSize: 11,
};

const ExpirationRow = ({ date }) => (
  <div style={labelStyle}>
    <span>Expiration Date:</span>
    {date}
  </div>
);

const NumberRow = ({ name, min }) => (
  <>
    <Field type="number" id={name} name={name} min={min || 0.0} step="any" />
  </>
);

export {
  labelStyle, ExpirationRow, NumberRow, errorStyle,
};
