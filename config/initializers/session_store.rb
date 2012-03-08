# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_comet_prototype_session',
  :secret      => '21e9521c6870bd55c6b2c5bba53ac203b475924f359a41ecb1f27a6cd0f74961a6fc2df497d174fb1ae1bc3aafb54a366905d38eb196852b9ab3e69440a3ad3f'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
