import 'package:vaccinemgmt/Animation/FadeAnimation.dart';
import 'package:flutter/material.dart';
import 'package:vaccinemgmt/shared/loading.dart';
import 'package:vaccinemgmt/globals.dart' as global;
import 'package:vaccinemgmt/homePage_rural.dart';
import 'package:vaccinemgmt/screens/Signup/signup_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

String loginurl = global.tunneldomain + "/database/login";
TextEditingController aadhaarController = TextEditingController();
TextEditingController pwdController = TextEditingController();
SharedPreferences? localStorage;

class Login extends StatefulWidget {
  @override
  _LoginState createState() => _LoginState();
  static Future init() async {
    localStorage = await SharedPreferences.getInstance();
  }
}

class _LoginState extends State<Login> {
  bool loading = false;

  @override
  Widget build(BuildContext context) {
    return loading
        ? Loading()
        : Scaffold(
            backgroundColor: Colors.grey[900],
            body: SingleChildScrollView(
              child: Column(
                children: <Widget>[
                  Container(
                    height: 400,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                          colorFilter: ColorFilter.mode(
                              Colors.lightGreen[400]!, BlendMode.modulate),
                          image: AssetImage('assets/images/background.png'),
                          fit: BoxFit.fill),
                    ),
                    child: Stack(
                      children: <Widget>[
                        Positioned(
                          left: 30,
                          width: 80,
                          height: 200,
                          child: FadeAnimation(1.0, Container(
                            decoration: BoxDecoration(
                              image: DecorationImage(image: AssetImage('assets/images/light-1.png')),
                            ),
                          )),
                        ),
                        Positioned(
                          left: 140,
                          width: 80,
                          height: 150,
                          child: FadeAnimation(1.3, Container(
                            decoration: BoxDecoration(
                              image: DecorationImage(image: AssetImage('assets/images/light-2.png')),
                            ),
                          )),
                        ),
                        Positioned(
                          child: FadeAnimation(1.6, Container(
                            margin: EdgeInsets.only(top: 50),
                            child: Center(
                              child: Text(
                                "Login",
                                style: TextStyle(
                                    fontFamily: "Varela",
                                    color: Colors.white,
                                    fontSize: 40,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          )),
                        )
                      ],
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(30.0),
                    child: Column(
                      children: <Widget>[
                        FadeAnimation(1.8, Container(
                          padding: EdgeInsets.all(5),
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                    color: Color.fromRGBO(143, 148, 251, .2),
                                    blurRadius: 20.0,
                                    offset: Offset(0, 10))
                              ]),
                          child: Column(
                            children: <Widget>[
                              Container(
                                padding: EdgeInsets.all(8.0),
                                decoration: BoxDecoration(
                                    border: Border(bottom: BorderSide(color: Colors.grey[100]!))),
                                child: TextField(
                                  controller: aadhaarController,
                                  decoration: InputDecoration(
                                      border: InputBorder.none,
                                      hintText: "Aadhaar number",
                                      hintStyle: TextStyle(color: Colors.grey[400])),
                                  onChanged: (text) {
                                    localStorage?.setString('email', text);
                                  },
                                ),
                              ),
                              Container(
                                padding: EdgeInsets.all(8.0),
                                child: TextField(
                                  controller: pwdController,
                                  obscureText: true,
                                  decoration: InputDecoration(
                                      border: InputBorder.none,
                                      hintText: "Password",
                                      hintStyle: TextStyle(color: Colors.grey[400])),
                                ),
                              )
                            ],
                          ),
                        )),
                        SizedBox(height: 30),
                        FadeAnimation(2.0, MaterialButton(
                          onPressed: () async {
                            setState(() => loading = true);
                            await Login.init();
                            try {
                              var data = {
                                "aadhar": aadhaarController.text.toString(),
                                "password": pwdController.text.toString()
                              };
                              var response = await http.post(Uri.parse(loginurl), body: data);
                              print(response.body);
                              if (response.body == "True") {
                                await localStorage?.setString('authenticated', "true");
                                await localStorage?.setString('aadhaar', aadhaarController.text.toString());
                                if (context.mounted) {
                                  Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => HomePageRural()));
                                }
                              } else {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text(response.body),
                                    backgroundColor: Colors.red,
                                  ));
                                }
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Login failed: $e")));
                              }
                            } finally {
                              if (mounted) setState(() => loading = false);
                            }
                          },
                          child: Container(
                            height: 50,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [Colors.teal[200]!, Colors.grey[700]!],
                              ),
                            ),
                            child: Center(
                              child: Text(
                                "Login",
                                style: TextStyle(
                                    fontSize: 18,
                                    fontFamily: "Varela",
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        )),
                        SizedBox(height: 30),
                        FadeAnimation(2.2, MaterialButton(
                          onPressed: () {
                            Navigator.of(context).push(MaterialPageRoute(builder: (context) => SignUpScreen()));
                          },
                          child: Text(
                            "Don't have an account ? Signup",
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontFamily: "Varela",
                                color: Colors.teal[200]),
                          ),
                        )),
                      ],
                    ),
                  )
                ],
              ),
            ),
          );
  }
}
