import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  NativeModules,
  Platform,
  Share,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';

var Aes = NativeModules.Aes;

const generateKey = (
  password: string,
  salt: string,
  cost: number,
  length: number,
) => Aes.pbkdf2(password, salt, cost, length);

const encryptData = (text: string, key: any) => {
  return Aes.randomKey(16).then((iv: any) => {
    return Aes.encrypt(text, key, iv).then((cipher: any) => ({
      cipher,
      iv,
    }));
  });
};

const encryptDataIV = (text: string, key: any, iv: any) => {
  return Aes.encrypt(text, key, iv).then((cipher: any) => ({
    cipher,
    iv,
  }));
};

const decryptData = (encryptedData: {cipher: any, iv: any}, key: any) =>
  Aes.decrypt(encryptedData.cipher, key, encryptedData.iv);

const iv_string = '0123456789abcdef0123456789abcdef';

let encrypt_key: any = '';
let encrypt_string: any = '';
let plain_string: any = '1234567890';
let encrypt_iv: any = '';

const onShare = async () => {
  try {
    const result = await Share.share({
      message: encrypt_string,
    });
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    alert(error.message);
  }
};

function AESEncrypt(plain_text) {
  const key = encrypt_key;
  try {
    encryptDataIV(plain_text, key, iv_string)
      .then(({cipher, iv}) => {
        encrypt_iv = iv;
        encrypt_string = cipher;
      })
      .catch((error: any) => {});
  } catch (e) {
    console.error(e);
  }
}

async function AESDecrypt(cipher_text) {
  const key = encrypt_key;
  const iv = encrypt_iv;
  const cipher = cipher_text;

  try {
    var decrypt_string = await decryptData({cipher, iv}, key);
    Alert.alert(
      "Decrypted Message",
      decrypt_string.toString(),
      [
        { text: "OK" }
      ],
      { cancelable: false }
    );
  } catch (e) {
    console.error(e);
  }
}

function checkInput(input) {
  if (input.length > 0) {
    return 1;
  } else {
    return 0;
  }
}

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const textInput = useRef();

  focusTextInput = () => textInput.current.focus();

  function myEncryptFunction(txt) {
    if (checkInput(txt)) {
      AESEncrypt(txt);
      Alert.alert(
        "Encrypted Message",
        encrypt_string.toString(),
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          {
            text: "Send",
            onPress: () => onShare(),
          }
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        'No Message',
        "It looks like you have not provided any message to encrypt.",
        [
          {
            text: "Enter message to encrypt",
            onPress: () => focusTextInput(),
          }
        ]
        );
    }
  }
  
  function myDecryptFunction(txt) {
    fetchCopiedText();
    if (checkInput(txt)) {
      AESDecrypt(txt);
    } else {
      Alert.alert(
        "Cannot Decrypt!",
        "There is no message to decrypt.\n\nIf you are certain you have copied the encrypted message, please hit the '\'Paste and Decrypt '\' button again."
      )
    }
  }

  const fetchCopiedText = async () => {
    const text = await Clipboard.getString();
    setMessage(text);
  };

  useEffect(() => {
    try {
      generateKey('suantonsing@gmail.com', 'SALT', 1000, 256).then(
        (key: any) => {
          encrypt_key = key;
          // console.log('Key: ' + key);
        },
      );
    } catch (e) {
      console.error(e);
    }
  });

  function onChangeFunction(text) {
    setMessage(text);
    AESEncrypt(text);
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E9B44C" />
      <SafeAreaView style={{flex: 1}}>
        <ScrollView>
        <View style={styles.container}>
          <View style={styles.introContainer}>
            <Text style={styles.introText}>
              Text Encryption-Decryption app. For personal use only.
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter Message Here:</Text>
            <TextInput
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              autoFocus={true}
              clearButtonMode="always"
              multiline={true}
              onChangeText={(text) => onChangeFunction(text)}
              placeholder="Enter A Message to Encrypt/Decrypt."
              ref={textInput}
              returnKeyType="done"
              selectionColor="#E3A11F"
              style={styles.input}
              textAlignVertical="top"
              value={message}
            />
          </View>
          <View style={styles.footer}>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => myEncryptFunction(message)}>
                <Text style={styles.buttonText}>Encrypt and Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => myDecryptFunction(message)}>
                <Text style={styles.buttonText}>Paste and Decrypt</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.copyright}>
              <Text style={styles.cText}>Suan Tonsing ✌🏻 2021</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    margin: 15,
  },
  introContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  introText: {
    textAlign: 'justify',
    // color: '#4C81E9',
    color: '#EF233C',
  },
  inputContainer: {
    marginVertical: 15,
    backgroundColor: '#e1e1e1',
    borderRadius: 3,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    lineHeight: 20,
    fontSize: 16,
    height: 200,
    marginBottom: 5,
    maxHeight: 500,
  },
  footer: {
    bottom: 0,
    position: 'relative',
  },
  buttonsContainer: {
    marginVertical: 10,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9B44C',
    padding: 15,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    // color: '#364156',
    // color: '#26547C',
    color: '#1A090D',
  },
  copyright: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2e2e2e',
    padding: 5,
    borderRadius: 3,
  },
  cText: {
    color: '#fff',
  },
};
