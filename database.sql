DROP DATABASE IF EXISTS :dbname;
CREATE DATABASE :dbname;

\c :dbname;

SET TIME ZONE 'UTC';

-- TABLES
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL,
	name TEXT NOT NULL,
	birthday DATE,
	profile_image_url TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	post_count INT NOT NULL DEFAULT 0,
    follower_count INT NOT NULL DEFAULT 0,
    following_count INT NOT NULL DEFAULT 0
);

CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
	content TEXT NOT NULL,
	author_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
	comment_count INT NOT NULL DEFAULT 0,
	like_count INT NOT NULL DEFAULT 0,
	modified_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE likes (
	user_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
	post_id INT NOT NULL REFERENCES posts ON DELETE CASCADE,
	since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (user_id, post_id)
);

CREATE TABLE comments (
	id SERIAL PRIMARY KEY,
	content TEXT NOT NULL,
	author_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
	post_id INT NOT NULL REFERENCES posts ON DELETE CASCADE,
	like_count INT NOT NULL DEFAULT 0,
	modified_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comment_likes (
	user_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
	comment_id INT NOT NULL REFERENCES comments ON DELETE CASCADE,
	since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (user_id, comment_id)
);


CREATE TABLE friendships (
	source_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
	target_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
	since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (source_id, target_id)
);

-- INDEXES
-- Make usernames case-insentive, nevertheless we want to keep the uppercase character for display purpose
CREATE UNIQUE INDEX idx_users_username ON users (LOWER(username));

-- FUNCTIONS
CREATE FUNCTION fn_post_counter() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$ BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE users SET post_count = post_count + 1 WHERE id = NEW.author_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE users SET post_count = post_count - 1 WHERE id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE FUNCTION fn_friendship_counter() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$ BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.source_id;
        UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.target_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE users SET following_count = following_count - 1 WHERE id = OLD.source_id;
        UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.target_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE FUNCTION fn_comment_counter() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$ BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE FUNCTION fn_like_counter() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$ BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE FUNCTION fn_comment_like_counter() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$ BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE FUNCTION fn_edit_content() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$ BEGIN
    IF (OLD.content != NEW.content) THEN
        NEW.modified_at := current_timestamp;
    END IF;
    RETURN NEW;
END;
$$;


-- TRIGGERS
CREATE TRIGGER tgr_post AFTER INSERT OR DELETE ON posts
FOR EACH ROW
EXECUTE PROCEDURE fn_post_counter();

CREATE TRIGGER tgr_comment AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE PROCEDURE fn_comment_counter();

CREATE TRIGGER tgr_friendship AFTER INSERT OR DELETE ON friendships
FOR EACH ROW
EXECUTE PROCEDURE fn_friendship_counter();

CREATE TRIGGER tgr_like AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE PROCEDURE fn_like_counter();

CREATE TRIGGER tgr_comment_like AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW
EXECUTE PROCEDURE fn_comment_like_counter();

CREATE TRIGGER tgr_update_post BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE PROCEDURE fn_edit_content();

CREATE TRIGGER tgr_update_comment BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE PROCEDURE fn_edit_content();
