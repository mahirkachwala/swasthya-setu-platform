import 'package:vaccinemgmt/homePage_rural.dart';
import 'package:flutter/material.dart';
import 'package:vaccinemgmt/login_new.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vaccinemgmt/shared/loading.dart';

SharedPreferences? localStorage;
bool loading = true;

class Authenticate extends StatefulWidget {
  @override
  _AuthenticateState createState() => _AuthenticateState();
}

class _AuthenticateState extends State<Authenticate> {
  @override
  void initState() {
    super.initState();
    dataget();
  }

  dataget() async {
    localStorage = await SharedPreferences.getInstance();
    setState(() {
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return Loading();

    final authenticated = localStorage?.getString('authenticated') == "true";
    return authenticated ? HomePageRural() : Login();
  }
}
