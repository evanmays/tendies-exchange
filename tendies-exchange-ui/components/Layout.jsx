const LayoutContainer = ({ children }) => (
  <div style={{
    margin: '20px auto',
    maxWidth: 800,
    fontSize: 18,
  }}
  >
    {children}
  </div>
);

const LayoutBox = ({ title, text }) => {
  const style = {
    border: '2px solid #F1E8B8',
    height: 200,
    textAlign: 'center',
    flex: '1 1 0',
    display: 'flex',
    minWidth: 250,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 12,
    boxSizing: 'border-box',
    margin: 10,
  };
  const pstyle = {
    margin: 0,
    fontSize: 38,
  };
  return (
    <div style={style}>
      <h3>{title}</h3>
      <p style={pstyle}>{text}</p>
    </div>
  );
};

const LayoutRow = ({ children }) => {
  const styles = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -10,
    marginRight: -10,
  };
  return (
    <div style={styles}>
      {children}
    </div>
  );
};

export { LayoutContainer, LayoutRow, LayoutBox };
