const LibraryComponent = require("./LibraryComponent");

/* Une Room est avant la Sandbox : on se connecte à une Room, on a un chat de Room, le message de
la Room (MODT), l'icone de la Room, éventuellement une interface pour les équipes etc...
Puis dès que le jeu commence, la Sandbox associée est démarrée (roomID = SandboxID) et tous les
clients de la Room se connectent à la Sandbox

La Room a besoin de la Sandbox pour fonctionner, puisque c'est la Sandbox qui détermine l'UID,
mais aussi le nombre de joueurs max, les mods installés...
On crée donc une Room depuis une Sandbox : Sandbox.createRoom()
*/

class Room extends LibraryComponent
{

}