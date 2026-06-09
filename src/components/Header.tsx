import styles from './Header.module.css'

const IgIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.07-.9.04-1.4.2-1.7.3-.4.17-.7.37-1 .67-.3.3-.5.6-.67 1-.1.3-.26.8-.3 1.7C3.3 8.5 3.3 8.9 3.3 12s0 3.5.07 4.7c.04.9.2 1.4.3 1.7.17.4.37.7.67 1 .3.3.6.5 1 .67.3.1.8.26 1.7.3 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c.9-.04 1.4-.2 1.7-.3.4-.17.7-.37 1-.67.3-.3.5-.6.67-1 .1-.3.26-.8.3-1.7.07-1.2.07-1.6.07-4.7s0-3.5-.07-4.7c-.04-.9-.2-1.4-.3-1.7a2.7 2.7 0 0 0-.67-1 2.7 2.7 0 0 0-1-.67c-.3-.1-.8-.26-1.7-.3C15.5 4 15.1 4 12 4zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2zm6.2-8.2a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/>
  </svg>
)

export default function Header({ instagram }: { instagram: string }) {
  return (
    <header className={styles.hero}>
      <div className={styles.wrap}>
        <h1 className={styles.brand}>
          MOO²<span className={styles.dot}>.</span>TW
        </h1>
        <p className={styles.jp}>Handmade Accessory</p>
        <p className={styles.tagline}>
          微光傾瀉，彷彿整片夜空都在你耳邊墜落<br />
          如花瓣般綻放的耳環，如晨露般晶瑩的髮圈<br />
          每件飾品都像是帶著故事的精靈，等待著找到自己的主人<br />
          期許來到這裡的你，能遇見那個屬於自己的小奇蹟與小美好
        </p>
        <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.igBtn}>
          <IgIcon />
          追蹤 @moo2.tw
        </a>
        <div className={styles.divider}>
          <span />
          <i className={styles.diamond} />
          <span />
        </div>
      </div>
    </header>
  )
}
