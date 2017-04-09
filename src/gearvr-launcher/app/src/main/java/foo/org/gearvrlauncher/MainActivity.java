package foo.org.gearvrlauncher;

import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

// Launches URL in Oculus Browser using Intents, rip off from https://github.com/machenmusik/LaunchOculusBrowser
// Is this officially documented somewhere?

public class MainActivity extends AppCompatActivity {

    final String AREENA_SERVER_URL = "192.168.0.106:8080";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Intent o = new Intent();
        o.setAction(Intent.ACTION_MAIN);
        o.setClassName("com.oculus.vrshell", "com.oculus.vrshell.MainActivity");
        o.setData(Uri.parse("apk://com.oculus.browser"));
        o.putExtra("uri", AREENA_SERVER_URL);
        startActivity(o);
        // If getting crash with error "Oculus Activity not found" you are running old version of
        // GearVR platform, run Oculus App in Android and let it update.

        // Looks like WebVR support is not there in Oculus Browser, there are lot of issues:
        // * the program icons are not loaded fully loaded
        // * video does not render properly, there are more artifacts than correct pixels in movie surface
        // * i should also add support for GearVR controls into player
        // * this is just experimental non-working, but fun stuff ATM
        finishAffinity();
    }
}
