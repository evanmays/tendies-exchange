import React, { useState } from 'react';

export default function TabContainer({ tabTitles, tabContent }) {
  const [activeKey, setActiveKey] = useState(tabTitles[0]);
  const styles = {
    width: '100%',
    height: 320,
    display: 'flex',
    flexDirection: 'row',
    background: 'black',
    border: '3px solid #F1E8B8',
    borderRadius: '20px',
    overflow: 'hidden',
  };
  const TabNavigation = {
    width: 200,
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    borderRight: '3px solid #F1E8B8',
  };
  const ActiveTabBody = {
    width: '100%',
    height: '100%',
    padding: '0px 20px',
  };
  return (
    <div style={styles}>
      <div style={TabNavigation}>
        {
              tabTitles.map(
                (title, index) => (
                  <TabItem
                    key={title}
                    index={index}
                    setActiveKey={() => { setActiveKey(title); }}
                    active={title === activeKey}
                  >
                    {title}
                  </TabItem>
                ),
              )
            }
      </div>
      <div style={ActiveTabBody}>
        {tabContent[tabTitles.indexOf(activeKey)]}
      </div>
    </div>
  );
}

const TabTitleSharedStyles = {
  padding: '1em',
  border: 'none',
  width: '100%',
  height: 'auto',
  fontSize: 'inherit',
  boxSizing: 'border-box',
  textAlign: 'inherit',
  margin: 'inherit',
  fontFamily: 'inherit',
};

const TabTitleActive = {
  ...TabTitleSharedStyles,
  background: '#F1E8B8',
  color: 'black',
};

const TabTitleInactive = {
  ...TabTitleSharedStyles,
  background: 'black',
  color: '#F1E8B8',
};

function TabItem({
  setActiveKey, active, children,
}) {
  return (
    <button
      type="button"
      onClick={setActiveKey}
      style={active ? TabTitleActive : TabTitleInactive}
    >
      {children}
    </button>
  );
}

/*
const TabHead = {
  border-bottom: 1px solid black,
  display: flex,
  background: black,
} */
