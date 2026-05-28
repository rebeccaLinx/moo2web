import styles from './Header.module.css'

const IgIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)

export default function Header({ instagram }: { instagram: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.name}>MOO<sup>2</sup></span>
          <span className={styles.dot}>.tw</span>
          <span className={styles.tagline}>耳環輕珠寶</span>
        </div>
        <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.igLink}>
          <IgIcon />
          @moo2.tw
        </a>
      </div>
    </header>
  )
}
