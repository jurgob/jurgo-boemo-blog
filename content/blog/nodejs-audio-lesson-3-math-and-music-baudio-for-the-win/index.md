---
  slug: "/posts/nodejs-audio-lesson-3-math-and-music-baudio-for-the-win/"
  date: 2021-08-04 00:30
  title: "Nodejs audio, lesson 3: math and music, baudio for the win"
  draft: false
  description: "What is audio? in unix everything is a file, even programs and devices. the way those things comunicate with each other, are strings (or numbers in this case). that means basically you can “play”…"
  categories: []
  keywords: []
---
  
Before you read this, be sure you read the [lesson 1](https://medium.com/@jurgo.boemo/nodejs-audio-lesson-1-enter-the-mic-9df64d0c1ad3) and [lesson 2](https://medium.com/@jurgo.boemo/nodejs-audio-lesson-2-math-and-music-baudio-for-the-win-e3ad98abf044)

What is audio? in unix everything is a file, even programs and devices. the way those things comunicate with each other, are strings (or numbers in this case).

that means basically you can “play” everything. That’s more or less the concept behind the npm package [baudio](https://github.com/substack/baudio).

**disclaimer:** I m gonna beefily cover this topic, so if you don’t understand it, just skim or skip. The porpouse here is just to show you that your microphone or music files are not the only thing you can use to produce audio.

create a file with

```js
touch lesson_03__math_music_baudio.js
```

now put this code in it:

![](/images/nodejs-audio-lesson-3-math-and-music-baudio-for-the-win-0.png)

find the full code [here](https://github.com/jurgob/nodejs_audio_examples/blob/main/lesson_03__math_music_baudio.js)

now just hear your “music” running:

```js
node lesson_03__math_music_baudio.js
```

you are gonna listen some white noise.

if you want to hear a different sound, just run

```js
node lesson_03__math_music_baudio.js 4
```

pass a number from 0 to 4 for different noises.

### What we did?

As usual, our speaker is a writable stream. baudio is basically a library that given a a callback is generating a readable stream.

```js
const music = baudio(musicSelected);
```
```js
music.pipe(speaker)
```

musicSeleceted in the end is the selected callback to generate the music we want, we use the operator .pipe as usual to play our music in our speakers.

**Some notes about baudio**

basically doing ”music” with baudio means implement a function that is accepting a t (is a point in time, is a float number that is gonna be bigger at every call) and must return a float number between -1 and 1.

If you are curious about the topic and you can to compose something more complicated that what I did , checkout this: [https://www.youtube.com/watch?v=2oz_SwhBixs](https://www.youtube.com/watch?v=2oz_SwhBixs)

**next lesson:** [Lesson 4: Apply some audio effects to your voice](https://medium.com/@jurgo.boemo/lesson-4-apply-some-audio-effects-to-your-voice-617d5a1b714e)
  