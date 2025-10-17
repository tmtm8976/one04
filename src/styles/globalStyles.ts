import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1A1A1A',
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#6C5CE7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    textTransform: 'capitalize',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  lable: {
    fontSize: 16,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
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
    backgroundColor: '#404040',
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
    color: '#B3B3B3',
  },
  smallerText: {
    fontSize: 12,
    color: '#B3B3B3',
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
    color: '#00D4AA',
  },
  between: {
    justifyContent: 'space-between',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  success: {
    color: '#00C851',
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
