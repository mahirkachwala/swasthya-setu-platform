import 'package:flutter/material.dart';
import 'package:vaccinemgmt/login_new.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:line_awesome_icons/line_awesome_icons.dart';
import 'package:share/share.dart';

class User extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ProfileScreen();
  }
}

class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  SharedPreferences? localStorage;

  @override
  void initState() {
    super.initState();
    _initStorage();
  }

  Future<void> _initStorage() async {
    localStorage = await SharedPreferences.getInstance();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      appBar: AppBar(
        title: Text("Profile"),
        backgroundColor: Colors.teal,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(height: 40),
            CircleAvatar(
              radius: 60,
              backgroundColor: Colors.teal.shade200,
              child: Icon(Icons.person, size: 80, color: Colors.black54),
            ),
            SizedBox(height: 20),
            Text(
              "Rural User",
              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Text(
              "Aadhaar: ${localStorage?.getString('aadhaar') ?? '...'}",
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            SizedBox(height: 40),
            _buildListItem(
              icon: Icons.share,
              text: "Invite a Friend",
              onTap: () {
                Share.share('Check out ImmunoChain app!');
              },
            ),
            _buildListItem(
              icon: Icons.logout,
              text: "Logout",
              onTap: () async {
                await localStorage?.setString('authenticated', "false");
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => Login()),
                    (route) => false,
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListItem({required IconData icon, required String text, required VoidCallback onTap}) {
    return ListTile(
      leading: Icon(icon, color: Colors.teal[200]),
      title: Text(text, style: TextStyle(color: Colors.white)),
      trailing: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.white30),
      onTap: onTap,
    );
  }
}
