class Message {
  final bool response;
  final String time; 
  final String text;
  final bool? unread;
  final bool isImageResponse;

  Message({
    required this.response,
    required this.time,
    required this.text,
    this.unread,
    required this.isImageResponse,
  });
}

// EXAMPLE MESSAGES IN CHAT SCREEN
List<Message> messages = [
  Message(
      response: true,
      time: '4:30 PM',
      text:
          "Hello, \nI am Immunnobot\nYour Assistant in this pandemic.\nI can resolve all your queries and give you tips. \nTell me how can I help you?",
      isImageResponse: false)
];
