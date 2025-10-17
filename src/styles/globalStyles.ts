import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: colors.background.secondary,
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.interactive.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
  },
  header: {
    textTransform: 'capitalize',
    fontSize: 24,
    fontWeight: 'light',
    marginBottom: 20,
    color: colors.text.primary,
  },
  lable: {
    fontSize: 16,
    marginBottom: 10,
    color: colors.text.primary,
  },
  input: {
    height: 40,
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 18,
    height: 100,
    padding: 15,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  line: {
    height: 1,
    backgroundColor: colors.surface.divider,
    marginVertical: 15,
  },
  my10: {
    marginVertical: 10,
  },
  my15: {
    marginVertical: 15,
  },
  my20: {
    marginVertical: 20,
  },
  mx10: {
    marginHorizontal: 10,
  },
  mx15: {
    marginHorizontal: 15,
  },
  mx20: {
    marginHorizontal: 20,
  },
  mt10: {
    marginTop: 10,
  },
  mt15: {
    marginTop: 15,
  },
  mt20: {
    marginTop: 20,
  },
  mb10: {
    marginBottom: 10,
  },
  mb15: {
    marginBottom: 15,
  },
  mb20: {
    marginBottom: 20,
  },
  smallText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  smallerText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap5: {
    gap: 5,
  },
  gap10: {
    gap: 10,
  },
  link: {
    color: colors.interactive.primary,
  },
  between: {
    justifyContent: 'space-between',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  success: {
    color: colors.status.success,
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  absolute: {
    position: 'absolute',
  },
  error: {
    color: colors.status.error,
    fontSize: 11,
    marginBottom: 10,
    textTransform: 'capitalize',
    position: 'absolute',
    bottom: -15,
  }
});
