import { View, Text, StyleSheet, Svg, Path, Rect } from '@react-pdf/renderer';

const COLORS = {
  primary: '#0F2345',
  blue: '#1D4ED8',
  blueLight: '#DBEAFE',
  danger: '#DC2626',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  headerContainer: {
    width: 242,
    height: 43, // ~28% de 153px
    position: 'relative',
    backgroundColor: COLORS.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16, // Marge de sécurité 16px
    height: 43,
    position: 'relative',
    zIndex: 1,
  },
  logoPlaceholder: {
    width: 35, // Taille équivalente visuelle
    height: 35,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    marginRight: 12,
  },
  titleGroup: { flexDirection: 'column' },
  saasName: { color: COLORS.white, fontSize: 18, fontWeight: 800, letterSpacing: 0.5 },
  clubName: { color: COLORS.danger, fontSize: 9, fontWeight: 700, marginTop: 1, letterSpacing: 1.2 },
});

export const CardHeader = ({ saasName = "KARATIX", clubName = "KARATE CLUB" }) => {
  return (
    <View style={styles.headerContainer}>
      <Svg style={{ position: 'absolute', top: 0, left: 0, width: 242, height: 43 }}>
        <Rect x="0" y="0" width="242" height="43" fill={COLORS.primary} />
        <Path d="M100 0 L242 0 L242 43 L80 43 Z" fill={COLORS.blue} />
        <Path d="M150 0 L242 0 L242 25 Z" fill={COLORS.blueLight} />
        <Path 
          d="M210 10 L225 5 L235 15 L220 30 L205 25 Z" 
          fill={COLORS.white} fillOpacity="0.05" 
        />
        <Path d="M0 42 L242 0" stroke={COLORS.danger} strokeWidth="2" />
      </Svg>
      <View style={styles.content}>
        <View style={styles.logoPlaceholder} />
        <View style={styles.titleGroup}>
          <Text style={styles.saasName}>{saasName}</Text>
          <Text style={styles.clubName}>{clubName}</Text>
        </View>
      </View>
    </View>
  );
};
