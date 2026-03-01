import 'package:shared_preferences/shared_preferences.dart';
import "package:http/http.dart" as http;

final String tunneldomain = "http://10.0.2.2:8000";

String userurl = tunneldomain + "/database/userDetails";
SharedPreferences? localStorage;

getUserDetails() async {
  localStorage = await SharedPreferences.getInstance();
  String aadhaar = localStorage?.getString('aadhaar') ?? '';
  print("Aadhar Captured " + aadhaar);

  var data = {"aadhar": aadhaar};
  http.post(Uri.parse(userurl), body: data).then((value) => {
        print(value.body),
      });
}
