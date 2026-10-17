-- board_members had no BEFORE UPDATE trigger to maintain updated_at, unlike
-- its sibling about_us tables (committees, accreditations). Add the standard
-- trigger so admin edits to board members keep an accurate updated_at.
CREATE TRIGGER update_board_members_modtime
  BEFORE UPDATE ON public.board_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
