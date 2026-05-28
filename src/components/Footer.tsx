import styles from './Footer.module.css'

const IgIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)

export default function Footer({ instagram }: { instagram: string }) {
  return (
    <footer className={styles.footer}>
      <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.igLink}>
        <IgIcon />
        追蹤 @moo2.tw
      </a>
      <p className={styles.copy}>© 2025 MOO².tw 版權所有</p>
    </footer>
  )
}
