import styles from './IntroSection.module.css'

export default function IntroSection({ intro }: { intro: string }) {
  return (
    <div className={styles.about}>
      <h2 className={styles.title}>關於 moo2</h2>
      <p className={styles.text}>{intro}</p>
      <p className={styles.note}>＊ 訂購與最新款式，請至 Instagram 私訊洽詢。</p>
    </div>
  )
}
