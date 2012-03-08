class CreateAtBats < ActiveRecord::Migration
  def self.up
    create_table :at_bats do |t|
      t.integer :position
      t.string :version
      t.binary :pitches
      t.integer :game_id

      t.timestamps
    end
  end

  def self.down
    drop_table :at_bats
  end
end
