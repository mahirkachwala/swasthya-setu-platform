import 'package:vaccinemgmt/models/immunostory_model.dart';
import 'package:vaccinemgmt/models/storyuser_model.dart';

final User user = User(
  name: '',
  profileImageUrl: '',
);
final List<Story> stories = [
  Story(
  url:
  'https://firebasestorage.googleapis.com/v0/b/bhartiyajavaparty.appspot.com/o/POLIO.mp4?alt=media',
    media: MediaType.video,
    duration: const Duration(seconds: 0),
    // user: user,
  ),
  Story(
  url:
  'https://firebasestorage.googleapis.com/v0/b/bhartiyajavaparty.appspot.com/o/SMALLPOX.mp4?alt=media',
    media: MediaType.video,
    // user: User(
    //   name: 'John Doe',
    //   profileImageUrl: 'https://wallpapercave.com/wp/AYWg3iu.jpg',
    // ),
    duration: const Duration(seconds: 0),
  ),
  // Story(
  //   url:
  //       'https://firebasestorage.googleapis.com/v0/b/bhartiyajavaparty.appspot.com/o/3immunohistory.mp4?alt=media',
  //   media: MediaType.video,
  //   duration: const Duration(seconds: 10),
  //   user: user,
  // ),
  // Story(
  //   url:
  //       'https://firebasestorage.googleapis.com/v0/b/bhartiyajavaparty.appspot.com/o/3immunohistory.mp4?alt=media',
  //   media: MediaType.video,
  //   duration: const Duration(seconds: 10),
  //   user: user,
  // ),
  // Story(
  //   url:
  //       'https://static.videezy.com/system/resources/previews/000/007/536/original/rockybeach.mp4',
  //   media: MediaType.video,
  //   duration: const Duration(seconds: 0),
  //   user: user,
  // ),
];
