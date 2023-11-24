---
  slug: "/posts/an_interactive_way_to_learn_javascript_jsquest/"
  date: 2021-08-17 22:19
  title: "An interactive way to learn javascript: jsquest"
  draft: false
  description: "Do you want to learn javascript / test your javascript skills, but reading articles and books is not your cup of tea?
  Here you go: https://jsquest.io"
  categories: []
  keywords: []
---

Do you want to learn javascript / test your javascript skills, but reading articles and books is not your cup of tea?

Here you go: https://jsquest.io

That s all you need to know, go there and play with it, you will get it, the rest of the article is gonna just be some blah blah about why I did it and how.

### What is this jsquest

If you are a person who can focus very intensively but just for very short amount of time, then I’m sure you struggle when you try to read books about coding. They are long, a lot of words, is hard to focus for me.

That’s why my preferred guide for js is this one: http://xahlee.info/js/js.html. I really think It’s describing JS in the minimum amount of words possible.

### The story of jsquest

**March 2007,** i need to do my driving license, and I decide to study for the theory exam by myself. I found this amazing app where there are questions divided by arguments. You can try to respond, if you fail, there’s a link to the theory of that argument. That s just amazing and in one week I pass the exam. (Then it took me months to pass the driving exam, but that’s another story).

**December 2011,** is night, I'm in my bed thinking: “I want to improve my JS skills". Js was my main language since a couple of years, but I felt I was using it like I was using JAVA (not in the best way, probably). So I’ve searched on google “advanced javascript”. I end up in this website where there was just some interactive code. Nothing else. But just trying to change the code, was enough for me to feel I was learning. It was mind blowing! Then I discovered that that website was supplementary material for [Secrets of the JavaScript Ninja](https://www.manning.com/books/secrets-of-the-javascript-ninja-second-edition?gclid=Cj0KCQjwvO2IBhCzARIsALw3ASpUYSSM4DP8wyBeWjvL5lDF2wR205voX6UfDx8SzfsgOeGi2izieTIaAnsUEALw_wcB) from [John Resig](https://johnresig.com/), the author of [jQuery](https://en.wikipedia.org/wiki/JQuery).

**February 2015,** my team leader at the time ask me to teach some javascript to our designer. Also, 3 friends of mine wanted to change their position at the same time, they were all JS developers. This is when I discover the [Xah Lee JS guide](http://xahlee.info/js/js.html) and I’ve started to use it to structure my lessons. I did with all of them several calls, i would say I’ve spent probably 20 hours with all of them to explain js fundamentals. The way I was doing this it was explaining them things via Skype and then Using a google docs to make them questions. In order to not have any misunderstanding, the questions were js code. And they had to respond with the result of the code execution. I call it *“forcing people to understand"*.

**October 2016,** another couple of people heard about those “courses” and they would love the idea of doing them but as you can imagine, is not easy to dedicate around 20 hours per person and everyone is busy, so is hard to get organized. Is also not particular pleasant to get lessons from me, patience is not exactly my best quality. That s when I’ve decided to do [jsquest](https://jsquest.io), taking inspiration from all the moments I told you.

### The how of jsquest

I’ve created this react website (which work also offline, because I’m obsessed with offline first JS app). So is a classic creater-react-app website.
I’m the most absent mind person ever, so in the very end every question is just an object in an array like this:

```js
const questions = [  
  {    
     text:"default assignment",
     code :"var a; log(a);"  
   },
    //...
]
```

The code is evaluated when you click “Check” with the js command eval, check here to see the implementation. it worked almost in every case aside some edge case where [not even stackoverflow could help me](https://stackoverflow.com/questions/40143683/execute-javascript-in-a-sand-box).

I save every given response in the local storage, evaluating on load time if they are true or not.
For doing the responsive layout, I‘ve experimented a little with the [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries) using the library ```react-container-query```

I 've beautified the code with this trick I used often in React, doing something like: 

```js
<pre>
 {JSON.stringify(code, null, '  ')}
</pre>
```

adding a string with two whitespace as the third argument of JSON.stringify, is gonna format the code using those two space as formatter token. 

I use it in my node.js debug all the time. The problem if you want to render this in html is that the content is automatically formatted, the only way to preserve the formatting is using the  tag `pre`.

I've tryed to use react component to do code highlight instead of this trick, but the render was slow and in the end I prefer a responsive user experience then adding the colors. 


### In the end
It was a fun experiment, the whole experience made me a better js developer. Probably online there are tons of better interactive platforms to test/study JS, such as https://justjavascript.com/, so if your goal is to learn JS, check around.

But if you like the project and you want to contribute, feel free to send your PR here: https://github.com/jurgob/js_questions.


