import styles from './Footer.module.css'

export default function Footer({ instagram }: { instagram: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        MOO²<span className={styles.dot}>.</span>TW
      </div>
      <div className={styles.links}>
        <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href={instagram} target="_blank" rel="noopener noreferrer">訂購私訊</a>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} moo2.tw ｜ 微光傾瀉, 仿佛整片夜空都在你耳邊墜落</p>
    </footer>
  )
}
