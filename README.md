# Duo-Break-Time
Use Duolingo lingots to buy minutes on blocked sites (selected by a parent or teacher, or yourself!)

    https://www.duolingo.com/comment/6969554

I've written this extension for my own needs, but of course I'll be very
pleased if it's useful to anybody else. Do remember that it's a work in
progress, and that I'm very open to critisism, so hopefully together we'll
be able to make it great. The initial goals of the project are to:

* Provide an incentive for my daughter to use Duo more (and more enthusiastically).

* Limit her time spent watching cartoons on YouTube.

Originally I thought I'd scrape the daily progress stats or similar but
then I realized that it might be fun to use lingots. After all, I'm on a
six-month streak in several languages so I have a ton of them, and she has
a few, so I reasoned that they might be a useful medium of exchange for
this purpose. Here's a rough specification:

* The student (my daughter in this case) completes lessons on Duo, earning lingots
* She goes to the store, and uses one lingot to purchase a certain amount
  of time on YouTube (or another configurable site).
- The extension will insert an extra shelf and item into the store (done).
- The extension will transfer a single lingot via the "give lingot"
  function in discussions to a configurable teacher or parent (done).
- The extension will turn on a configurable timer which will allow access
  to a configurable list of blocked sites (done).
* If she runs out of lingots she has to do more lessons. Yay!!!
* If I want I can give the lingots back, again using a comment. Of course
  I'll need a thread for that. I can give them back for anything really,
  including real-world stuff, or progress on other learning sites like Khan
  academy.

Now, the current state of the project is configurable to the extent that
you can choose how long to allow the blocked sites per lingot, and you can
choose which comment the lingot goes to. That's right, you have to choose a
comment, because for the moment in Duolingo you can't simply specify a user
to whome to give a lingo: it has to be for a comment.

So this means that you have to have at least one useful comment in the
discussions before anyone can give you a lingot, including this extension.
I'll provide more documentation on how to do that, and how to find the ID
in the coming days.

