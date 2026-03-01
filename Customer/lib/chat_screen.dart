import 'dart:io';
import 'package:flutter/material.dart';
import 'package:vaccinemgmt/models/message_model.dart';
import 'package:vaccinemgmt/models/user_model.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:file_picker/file_picker.dart';
// firebase packages temporarily disabled while migrating to a legacy toolchain.
// import 'package:firebase_storage/firebase_storage.dart';
// import 'package:firebase_core/firebase_core.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:vaccinemgmt/globals.dart';

  SharedPreferences? localStorage;

class ChatScreen extends StatefulWidget {
  final User? user;

  ChatScreen({Key? key, this.user}) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  bool _uploadenabled = false;
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _textController = TextEditingController();
  String _userInput = "";

  @override
  void initState() {
    super.initState();
    _initStorage();
    _getUserLocation();
  }

  Future<void> _initStorage() async {
    localStorage = await SharedPreferences.getInstance();
  }

  Future<void> _getUserLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        _sendData("${position.latitude}\t${position.longitude}");
      }
    } catch (e) {
      print("Location error: $e");
    }
  }

  Future<void> _sendData(String data) async {
    // Optional: send metadata to backend
  }

  Future<void> _handleUpload(List<PlatformFile> files) async {
    setState(() => _uploadenabled = false);
    try {
      // Temporary fallback: don't actually upload; insert the local file path as a message.
      for (var file in files) {
        if (file.path == null) continue;
        String url = "file://${file.path!}";
        setState(() {
          messages.insert(0, Message(response: false, time: _getTime(), text: url, isImageResponse: true));
        });
        _queryBot("Document: $url");
      }
    } catch (e) {
      print("Upload error: $e");
    }
  }

  String _getTime() => "${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}";

  void _queryBot(String text) async {
    try {
      final response = await http.post(
        Uri.parse("$tunneldomain/chatbot/chat"),
        headers: {"Content-Type": "application/json"},
        body: json.encode({"message": text, "aadhaar": localStorage?.getString('aadhaar') ?? "Unknown"}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          messages.insert(0, Message(
            response: true,
            time: _getTime(),
            text: data['response'] ?? "I didn't understand that.",
            isImageResponse: false,
          ));
          if (data['intent'] == 'Prepare_to_Upload') {
            _uploadenabled = true;
          }
        });
      }
    } catch (e) {
      print("Chat error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(radius: 20, backgroundImage: AssetImage('assets/images/bot.jpg')),
            SizedBox(width: 15),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("ImmunoBot", style: TextStyle(fontSize: 16)),
                Text("Online", style: TextStyle(fontSize: 12, color: Colors.greenAccent)),
              ],
            ),
          ],
        ),
  backgroundColor: Colors.teal.shade400,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: true,
              controller: _scrollController,
              padding: EdgeInsets.all(20),
              itemCount: messages.length,
              itemBuilder: (context, index) => _buildChatBubble(messages[index]),
            ),
          ),
          _buildMessageArea(),
        ],
      ),
    );
  }

  Widget _buildChatBubble(Message message) {
    bool isMe = !message.response;
    return Column(
      children: [
        Container(
          alignment: isMe ? Alignment.topRight : Alignment.topLeft,
          child: Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
            padding: EdgeInsets.all(12),
            margin: EdgeInsets.symmetric(vertical: 5),
              decoration: BoxDecoration(
              color: isMe ? Colors.teal.shade300 : Colors.white,
              borderRadius: BorderRadius.circular(15),
            ),
            child: message.isImageResponse
                ? CachedNetworkImage(imageUrl: message.text, placeholder: (_, __) => CircularProgressIndicator())
                : Text(message.text, style: TextStyle(color: Colors.black87)),
          ),
        ),
        Row(
          mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
          children: [
            if (!isMe) CircleAvatar(radius: 10, backgroundImage: AssetImage('assets/images/bot.jpg')),
            SizedBox(width: 5),
            Text(message.time, style: TextStyle(color: Colors.white70, fontSize: 10)),
            if (isMe) ...[SizedBox(width: 5), CircleAvatar(radius: 10, backgroundImage: AssetImage('assets/images/nick-fury.jpg'))],
          ],
        ),
      ],
    );
  }

  Widget _buildMessageArea() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8),
      height: 70,
      color: Colors.grey[900],
      child: Row(
        children: [
          IconButton(
            icon: Icon(Icons.attach_file),
            color: _uploadenabled ? Colors.teal.shade200 : Colors.grey,
            onPressed: _uploadenabled ? () async {
              FilePickerResult? result = await FilePicker.platform.pickFiles(allowMultiple: true);
              if (result != null) _handleUpload(result.files);
            } : null,
          ),
          Expanded(
            child: TextField(
              controller: _textController,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration.collapsed(hintText: "Send a message...", hintStyle: TextStyle(color: Colors.white30)),
              onChanged: (val) => _userInput = val,
            ),
          ),
          IconButton(
            icon: Icon(Icons.send),
            color: Colors.teal.shade200,
            onPressed: () {
              if (_userInput.trim().isEmpty) return;
              setState(() {
                messages.insert(0, Message(response: false, time: _getTime(), text: _userInput, isImageResponse: false));
                _userInput = "";
                _textController.clear();
              });
              _queryBot(messages.first.text);
            },
          ),
        ],
      ),
    );
  }
}
