import styles from './IntroSection.module.css'

export default function IntroSection({ intro }: { intro: string }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.text}>{intro}</p>
      </div>
    </section>
  )
}
