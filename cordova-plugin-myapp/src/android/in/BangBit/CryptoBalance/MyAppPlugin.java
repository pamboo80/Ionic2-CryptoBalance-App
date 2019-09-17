package in.BangBit.CryptoBalance;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.provider.Settings.Secure;

import android.util.Base64;
import android.util.Log;

import java.security.Key;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class MyAppPlugin extends CordovaPlugin {
  private static final String ALGORITHM = "AES";
  public static final String GET_ANDROID_ID = "getAndroidID";
  public static final String ENCRYPT = "encrypt";
  public static final String DECRYPT = "decrypt";

  //This thread handler
  private Handler myHandler = null;

  //Java lock
  private static final Object LOCK = MyAppPlugin.class;

  /**
   * Gets the application context from cordova's main activity.
   *
   * @return the application context
   */
  private Context getApplicationContext() {
    return this.cordova.getActivity().getApplicationContext();
  }

  private Activity getActivity() {
    return this.cordova.getActivity();
  }

  private String android_id = "";

  private String getAndroidID() {
    if (android_id != "") return android_id;
    if (getApplicationContext() != null) {
      android_id = Secure.getString(getApplicationContext().getContentResolver(),
        Secure.ANDROID_ID);
    }
    return android_id;
  }

  private static Key generateKey(String androidId) throws Exception {
    Key key = new SecretKeySpec(androidId.getBytes(), ALGORITHM);
    return key;
  }

  @Override
  public boolean execute(String action, JSONArray data, CallbackContext callbackContext) {
    Log.d("MyAppPlugin", "This is native function called from PhoneGap/Cordova!");

    //only perform the action if it is the one that should be invoked
    if (GET_ANDROID_ID.equals(action)) {
      try {

        getAndroidID();
        if (android_id.length() > 0) {
          JSONObject jo = new JSONObject(data.toString().substring(1, data.toString().length() - 1));
          jo.put("ANDRIOD_ID", android_id);
          //return new PluginResult(PluginResult.Status.OK, jo.toString()); //2.9
          callbackContext.success(jo.toString());
          return true;
        } else {
          //return new PluginResult(PluginResult.Status.ERROR, ""); //2.9
          callbackContext.error("");
          return false;
        }
      } catch (Exception ex) {
        Log.d("MyAppPlugin", ex.toString());
        //return new PluginResult(PluginResult.Status.ERROR, "error" + ex.toString()); //2.9
        callbackContext.error(ex.toString()); //callbackContext.error(ex.getMessage());
        return false;
      }
    }
    if (ENCRYPT.equals(action)) {
      try {
        JSONObject jsonObject = new JSONObject(data.toString().substring(1, data.toString().length() - 1));

        Key key = generateKey(getAndroidID());
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] encryptedByteValue = cipher.doFinal(jsonObject.getString("address").getBytes("utf-8"));
        String encryptedValue64 = Base64.encodeToString(encryptedByteValue, Base64.DEFAULT);
        jsonObject.put("address", encryptedValue64.trim());
        callbackContext.success(jsonObject.toString());
        return true;
      } catch (Exception ex) {
        Log.d("MyAppPlugin", ex.toString());
        //return new PluginResult(PluginResult.Status.ERROR, "error" + ex.toString()); //2.9
        callbackContext.error(ex.toString()); //callbackContext.error(ex.getMessage());
        return false;
      }
    }

    if (DECRYPT.equals(action)) {
      try {
        JSONObject jsonObject = new JSONObject(data.toString().substring(1, data.toString().length() - 1));
        int length = jsonObject.getInt("length");
        Key key = generateKey(getAndroidID());
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key);
        for (int i = 0; i < length; i++) {
          byte[] decryptedValue64 = Base64.decode(jsonObject.getString("address" + String.valueOf(i)), Base64.DEFAULT);
          byte[] decryptedByteValue = cipher.doFinal(decryptedValue64);
          String decryptedValue = new String(decryptedByteValue, "utf-8");
          jsonObject.put("address"+String.valueOf(i), decryptedValue.trim());
        }
        callbackContext.success(jsonObject.toString());
        return true;

      } catch (Exception ex) {
        Log.d("MyAppPlugin", ex.toString());
        //return new PluginResult(PluginResult.Status.ERROR, "error" + ex.toString()); //2.9
        callbackContext.error(ex.toString()); //callbackContext.error(ex.getMessage());
        return false;
      }
    }

    callbackContext.error("No match");
    return false;

  }
}
