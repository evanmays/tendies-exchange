const Footer = () => {
  const styles = {
    textAlign: 'center',
    marginTop: 60,
  };
  return (
    <div style={styles}>
      <p>
        Brought to you by
        {' '}
        <a
          href="https://twitter.com/evanon0ping"
          alt="Site Creator's Twitter"
        >
          evanon0ping.eth
        </a>
      </p>
      <a href="https://umaproject.org">
        <img
          src="/UMAInside.png"
          alt="Powered by UMA Logo"
          width={80}
        />
      </a>
    </div>
  );
};

export default Footer;
