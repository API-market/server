The aikon routes are in the aikon routes file.

you'll need an `apimarket_config.json` file in the root directory (I have it)

This integration grabs all the required info (Email, name, EOS id) and sends it to the UI.

In further iterations we need to grab more user info.

Only two new endpoints are added (`/auth` and `/user`). `/user` doesnt do much yet, BUT
its open to grab more data from ORE-ID.