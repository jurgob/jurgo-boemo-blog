---
  slug: "/posts/lesson-4-apply-some-audio-effects-to-your-voice/"
  date: 2021-08-04 02:33
  title: "Nodejs audio, lesson 4: apply some audio effects to your voice"
  draft: false
  description: "As we learned in lesson 1 and lesson 2, your mic is a readable stream and your speakers are a writable stream, to make them work together you just need to pipe them. for this we are gonna put…"
  categories: []
  keywords: []
---
  
As we learned in [lesson 1](https://medium.com/@jurgo.boemo/nodejs-audio-lesson-1-enter-the-mic-9df64d0c1ad3) and [lesson 2](https://medium.com/@jurgo.boemo/nodejs-audio-lesson-2-math-and-music-baudio-for-the-win-e3ad98abf044), your mic is a [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams) and your speakers are a [writable stream](https://nodejs.org/api/stream.html#stream_writable_streams), to make them work together you just need to pipe them.

But what if we want to apply some audio effects to our voice?

for this we are gonna put \`something\` in the between of those 2 streams. this something is gonna be an npm library called [sox-audio](https://www.npmjs.com/package/sox-audio)

let’s install it with

```js
npm install -s sox-audio
```

then let’s create a file:

```js
touch lesson_04__p1_audio_effects.js
```

and let’s add this code in it:

![](/images/lesson-4-apply-some-audio-effects-to-your-voice-0.png)

find the [full code here](https://github.com/jurgob/nodejs_audio_examples/blob/main/lesson_04__p1_audio_effects.js)

now run

```js
node lesson_04__p1_audio_effects.js
```

and try to talk: you should hear your voice like you are inside of a garage. I suggest you to use an headset during your tests, if you don’t you will add an echo in your voice and you will probably not be able to appreciate reverb effect.

### Tell me more about audio effects

In general, sox-audio is just a wrapper on top of sox, so you can search online how to apply effects, but when you call `addEffect` you are colling the cli command under the hood, so you can take any example of sox usage and apply the same params. here is a good article to start: [https://h3manth.com/2009/01/08/sox-sound-exchange-2](https://h3manth.com/2009/01/08/sox-sound-exchange-2)

.

check out the lesson 4 part 2 file here: [https://github.com/jurgob/nodejs\_audio\_examples/blob/main/lesson\_04\_\_p2\_multiple\_audio_effects.js](https://github.com/jurgob/nodejs_audio_examples/blob/main/lesson_04__p2_multiple_audio_effects.js)

you can specify a number from 0 to 3, corrisponding to a different effect:

```js
node lesson_04__p2_multiple_audio_effects.js 3  
  

```
  