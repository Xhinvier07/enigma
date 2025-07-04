# Group Functionality Setup Guide

This guide explains how to set up and use the new group-based access code functionality in the Enigma application.

## Overview of Changes

The application has been updated to support group-based authentication with the following features:

1. Access codes are now used by groups rather than individuals
2. Multiple members (1-8) can join using the same access code
3. Progress (answered questions and points) is shared across all group members
4. Question order is consistent for all members using the same access code
5. When a game ends (by timer or button), it ends for all members of the group

## Database Setup

To add group functionality, you need to run the migration script to update your database schema:

1. Go to your Supabase dashboard and open the SQL Editor
2. Copy and paste the contents of `src/scripts/group-migration.sql` into a new query
3. Run the query to add the required columns and functions

This migration:
- Adds a `group_members` column (text array) to store member names
- Adds a `question_seed` column for consistent question ordering
- Creates helper functions for group management
- Updates existing functions to support group operations

## How It Works

### Authentication Flow

1. Users enter an access code and add 1-8 group members
2. If the access code hasn't been used before, a new group session is created
3. If the access code is already in use, the new members join the existing session
4. The timer starts when the first member joins and applies to all members

### Game Session

- All members see the same questions in the same order
- When any member answers a question correctly, it's marked as completed for all
- Points are shared across the group
- If any member ends the game early, it ends for everyone using that access code
- When the timer runs out, the game ends for all members simultaneously

## Testing the Group Functionality

1. Open the application in two separate browsers or incognito windows
2. In the first window, enter an access code and add 1-3 member names
3. Start the game and answer a few questions
4. In the second window, use the same access code and add different members
5. Verify that:
   - The second session shows the same remaining time as the first
   - Questions answered in the first session appear completed in the second
   - Points earned are consistent across sessions

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that the database migration was applied correctly
3. Make sure the SQL functions were created successfully

Common issues:
- If questions aren't synchronized, check that the `question_seed` is being set
- If joining a group doesn't work, ensure the `checkExistingGroup` function is working
- If progress isn't shared, check that both users are using exactly the same access code

## Additional Considerations

- **Security**: Remember that anyone with an access code can join a group
- **Performance**: With many users joining the same group, consider implementing rate limiting
- **User Experience**: Consider adding a way for users to see other members in their group 