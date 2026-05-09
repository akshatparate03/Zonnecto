package com.zonnecto.repository;

import com.zonnecto.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT c FROM ChatRoom c WHERE (c.user1Id = ?1 OR c.user2Id = ?1) ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<ChatRoom> findAllForUser(Long userId);

    @Query("SELECT c FROM ChatRoom c WHERE (c.user1Id = ?1 AND c.user2Id = ?2) OR (c.user1Id = ?2 AND c.user2Id = ?1)")
    Optional<ChatRoom> findBetweenUsers(Long user1Id, Long user2Id);

    @Query("SELECT c FROM ChatRoom c WHERE ((c.user1Id = ?1 AND c.user2Id = ?2) OR (c.user1Id = ?2 AND c.user2Id = ?1))")
    List<ChatRoom> findAllBetweenUsers(Long user1Id, Long user2Id);

    @Query("SELECT c FROM ChatRoom c WHERE (c.user1Id = ?1 OR c.user2Id = ?1) AND c.roomType = 'FRIEND_CHAT' ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<ChatRoom> findFriendChatsForUser(Long userId);

    // Recent rooms for matching service
    @Query("SELECT c FROM ChatRoom c WHERE (c.user1Id = ?1 OR c.user2Id = ?1) AND c.roomType = 'RANDOM_MATCH' ORDER BY c.createdAt DESC")
    List<ChatRoom> findRecentRoomsForUser(Long userId);
}