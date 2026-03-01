/// Simplified HomePage for rural user app.
/// Replace homePage.dart with this, or rename and update authenticate.dart.
/// Tabs: Voice (Sarvam), Book, Centers
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:vaccinemgmt/chat_screen.dart';
import 'package:vaccinemgmt/globals.dart';
import 'package:vaccinemgmt/user.dart';
import 'package:vaccinemgmt/models/user_model.dart' as user_model;

class HomePageRural extends StatefulWidget {
  @override
  _HomePageRuralState createState() => _HomePageRuralState();
}

class _HomePageRuralState extends State<HomePageRural> {
  int _currentIndex = 0;
  final List<Widget> _children = [
  ChatScreen(user: user_model.currentUser),
    _BookTab(),
    _CentersTab(),
    User(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _children[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.black87,
        onTap: (i) => setState(() => _currentIndex = i),
        currentIndex: _currentIndex,
  selectedItemColor: Colors.teal.shade200,
        unselectedItemColor: Colors.white,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.mic), label: "Voice"),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: "Book"),
          BottomNavigationBarItem(icon: Icon(Icons.location_on), label: "Centers"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}

class _BookTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_today, size: 64, color: Colors.teal.shade200),
            SizedBox(height: 16),
            Text("Book Appointment", style: TextStyle(fontSize: 20, color: Colors.white)),
            SizedBox(height: 8),
            Text("Use Voice tab to book via Sarvam AI,\nor integrate manual form here.", textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[400])),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => _bookViaApi(context),
              child: Text("Test: Create appointment"),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _bookViaApi(BuildContext context) async {
    try {
      final baseUrl = tunneldomain;
      final res = await http.post(
        Uri.parse("$baseUrl/api/appointments"),
        headers: {"Content-Type": "application/json"},
        body: '{"aadhaarHash":"DEMO123","centerId":"PHC-001","centerName":"Test Center","slot":"10:00-10:30","dose":1}',
      );
      if (res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Appointment created! Check doctor portal.")));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: ${res.body}")));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    }
  }
}

class _CentersTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.location_on, size: 64, color: Colors.teal[200]),
            SizedBox(height: 16),
            Text("Nearest Vaccination Centers", style: TextStyle(fontSize: 20, color: Colors.white)),
            SizedBox(height: 8),
            Text("Integrate Google Maps + VaccinationCenters API.\nUse geolocator for user location.", textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[400])),
          ],
        ),
      ),
    );
  }
}
