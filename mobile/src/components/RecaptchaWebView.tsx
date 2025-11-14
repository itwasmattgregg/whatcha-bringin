import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface RecaptchaWebViewProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
}

export default function RecaptchaWebView({ siteKey, onVerify, onError }: RecaptchaWebViewProps) {
  const webViewRef = useRef<WebView>(null);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">
      </head>
      <body style="margin:0;padding:0;background:transparent;">
        <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}&onload=onRecaptchaLoad" async defer></script>
        <script>
          (function() {
            var attempts = 0;
            var maxAttempts = 10;
            var retryDelay = 500;

            function sendMessage(type, data) {
              try {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({type: type, ...data}));
                } else {
                  console.error('ReactNativeWebView not available');
                }
              } catch(e) {
                console.error('Error posting message:', e);
              }
            }

            function executeRecaptcha() {
              attempts++;
              try {
                if (typeof grecaptcha === 'undefined') {
                  if (attempts < maxAttempts) {
                    console.log('reCAPTCHA not loaded yet, retrying... attempt ' + attempts);
                    setTimeout(executeRecaptcha, retryDelay);
                    return;
                  } else {
                    console.error('reCAPTCHA script failed to load after ' + maxAttempts + ' attempts');
                    sendMessage('error', {error: 'reCAPTCHA script failed to load. Please check your internet connection.'});
                    return;
                  }
                }

                console.log('reCAPTCHA loaded, executing...');
                grecaptcha.ready(function() {
                  grecaptcha.execute('${siteKey}', {action: 'submit'})
                    .then(function(token) {
                      console.log('reCAPTCHA token received');
                      sendMessage('success', {token: token});
                    })
                    .catch(function(error) {
                      console.error('reCAPTCHA execute error:', error);
                      sendMessage('error', {error: error.toString()});
                    });
                });
              } catch(error) {
                console.error('Error executing reCAPTCHA:', error);
                sendMessage('error', {error: error.toString()});
              }
            }

            // Global callback for when reCAPTCHA script loads
            window.onRecaptchaLoad = function() {
              console.log('reCAPTCHA script loaded via onload callback');
              executeRecaptcha();
            };

            // Wait for DOM to be ready
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              // Start attempting after a short delay
              setTimeout(executeRecaptcha, 500);
            } else {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(executeRecaptcha, 500);
              });
              window.addEventListener('load', function() {
                setTimeout(executeRecaptcha, 500);
              });
              // Fallback: start trying after a delay
              setTimeout(executeRecaptcha, 1000);
            }
          })();
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'success' && data.token) {
        onVerify(data.token);
      } else if (data.type === 'error') {
        console.error('reCAPTCHA error:', data.error);
        onError?.(data.error || 'reCAPTCHA verification failed');
      }
    } catch (error) {
      console.error('Error parsing reCAPTCHA message:', error);
      onError?.('Failed to parse reCAPTCHA response');
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    onError?.('Failed to load reCAPTCHA. Please check your internet connection.');
  };

  // No need for the useEffect with reload - the WebView will load automatically

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        onError={handleError}
        onLoadEnd={() => {
          console.log('WebView loaded, reCAPTCHA script should execute automatically');
        }}
        onLoadStart={() => {
          console.log('WebView started loading');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        cacheEnabled={true}
        incognito={false}
        startInLoadingState={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: 200,
    opacity: 0.001, // Almost invisible but enough to render and load scripts
    position: 'absolute',
    top: -2000,
    left: -2000,
    overflow: 'hidden',
    zIndex: -1,
  },
  webview: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});

