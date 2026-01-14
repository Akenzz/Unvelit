import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import uvLogo from '/logo-fr2.png';
import starBackground from '/stars.jpg';
import unveilText from '/txtlogo.png';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeOutDelay = 3300;
    const finishDelay = 4000;

    const fadeTimeout = setTimeout(() => setIsVisible(false), fadeOutDelay);
    const finishTimeout = setTimeout(() => onFinish(), finishDelay);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(finishTimeout);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            ...styles.container,
            backgroundImage: `url(${starBackground})`,
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="splash-content"
          >
            <motion.img
              src={uvLogo}
              alt="UV Logo"
              className="logo"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              style={styles.logo}
            />

            <motion.img
              src={unveilText}
              alt="UnveilIt Text"
              className="flicker text-image"
              style={styles.textImage}
            />
          </motion.div>

          <style>
            {`
              .flicker {
                animation: flickerAnim 2.5s infinite;
              }

              @keyframes flickerAnim {
                0%   { opacity: 0.9; }
                5%   { opacity: 0.4; }
                10%  { opacity: 0.95; }
                15%  { opacity: 0.3; }
                20%  { opacity: 1; }
                25%  { opacity: 0.7; }
                30%  { opacity: 0.9; }
                35%  { opacity: 0.5; }
                40%  { opacity: 1; }
                100% { opacity: 0.9; }
              }

              .splash-content {
                display: flex;
                align-items: center;
                flex-direction: row;
                padding: 1rem;
                gap: 1rem;
                flex-wrap: wrap;
                justify-content: center;
              }

              @media (max-width: 768px) {
                .logo {
                  height: 10vh !important;
                }

                .text-image {
                  height: 9vh !important;
                }

                .splash-content {
                  margin-top: -150px;
                }
              }

              @media (min-width: 868px) {
                .splash-content {
                  margin-top: -100px;
                }
              }
            `}
          </style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: '#000',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    zIndex: 9999,
    paddingTop: '8vh',
  },
  logo: {
    height: '13vh',
    width: 'auto',
  },
  textImage: {
    height: '13vh',
    width: 'auto',
  },
};