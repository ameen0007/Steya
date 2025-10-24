import { View, Text, StyleSheet, Linking } from 'react-native';

// Add this component where your footer text is
const ClickableFooter = () => {
  const handleTermsPress = () => {
    Linking.openURL('https://steya-landing.vercel.app/PrivacyPolicy');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://steya-landing.vercel.app/PrivacyPolicy');
  };

  return (
  <View style={styles.footerContainer}>
  <Text style={styles.footerText}>
    By continuing, you agree to our{' '}
    <Text style={styles.linkText} onPress={handleTermsPress}>
      Terms
    </Text>
    {' & '}
    <Text style={styles.linkText} onPress={handlePrivacyPress}>
      Privacy
    </Text>
  </Text>
</View>

  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    position: 'absolute',
    bottom: '14%',
    paddingHorizontal: 20,
   
    paddingVertical: 12,
    borderRadius: 12,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  linkText: {
    color: 'white',
    fontWeight: '700',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ClickableFooter;