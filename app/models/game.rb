class Game < ActiveRecord::Base
    has_many :at_bats, :order => "position desc"
end
