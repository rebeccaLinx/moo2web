import styles from './Footer.module.css'

export default function Footer({ instagram }: { instagram: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        moo2<span className={styles.dot}>.</span>tw
      </div>
      <div className={styles.links}>
        <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href={instagram} target="_blank" rel="noopener noreferrer">訂購私訊</a>
      </div>
      <p className={styles.copy}>© 2026 moo2.tw ｜ 手作耳飾 · 以藍為調</p>
    </footer>
  )
}
