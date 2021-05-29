import express, {json, Request, Response} from 'express';
import {
  APIGuildInteraction,
  APIInteraction,
  InteractionResponseType,
  InteractionType,
  Snowflake,
} from 'discord-api-types';
import {verify} from 'noble-ed25519';
import {default as a} from 'axios';

import {
  colorRoleSelector,
  otherRoleSelector,
  pronounRoleSelector,
  roleTypeButtons,
} from './dropdown';
import {otherRoles, pronounRoles} from './roles';

const PUBLIC_KEY = process.env.PUBLIC_KEY!;

const axios = a.create({
  baseURL: 'https://discord.com/api/v9/interactions',
  validateStatus: () => true,
});

const axiosBot = a.create({
  baseURL: 'https://discord.com/api/v9',
  validateStatus: () => true,
  headers: {
    authorization: `Bot ${process.env.DISCORD_TOKEN!}`,
  },
});

const app = express();

app.use(json());

app.post('/', async (req: Request<{}, {}, APIInteraction>, res: Response) => {
  const sig = req.headers['x-signature-ed25519'] as string;
  const time = req.headers['x-signature-timestamp'] as string;

  const isValid = await verify(
    sig,
    Buffer.concat([Buffer.from(time), Buffer.from(JSON.stringify(req.body))]),
    PUBLIC_KEY
  );

  if (!isValid) {
    return res.status(401).send('Unauthorized');
  }

  if (req.body.type === InteractionType.Ping) {
    return res.status(200).json({
      type: InteractionType.Ping,
    });
  }

  const i = req.body as APIGuildInteraction;

  if (req.body.type === InteractionType.Component && i.data) {
    if (i.data?.component_type === 2) {
      // these are arrow functions to make them lazy
      const selectors = {
        pronouns: (r: Snowflake[]) => pronounRoleSelector(r),
        colors: () => colorRoleSelector,
        other: (r: Snowflake[]) => otherRoleSelector(r),
      };

      const selector = selectors[i.data.custom_id as keyof typeof selectors];

      if (!selector) {
        return;
      }

      const h = {
        type: 7,
        data: {
          components: [
            {type: 1, components: roleTypeButtons(i.data.custom_id as string)},
            {type: 1, components: [selector(i.member.roles)]},
          ],
        },
      };

      return await axios.post(`/${i.id}/${i.token}/callback`, h);
    }

    if (i.data?.component_type === 3) {
      const roleMaps = {
        pronoun_roles: pronounRoles,
        other_roles: otherRoles,
      };

      const r = roleMaps[i.data.custom_id as keyof typeof roleMaps];

      if (!r) {
        return;
      }

      await manageRoles(i, r);

      return res.status(200).json({type: 6});
    }
  }

  if (i.type === InteractionType.ApplicationCommand && i.data) {
    switch (i.data.name) {
      case 'test': {
        const h = {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            flags: 64,
            content: 'Self Assignable Roles',
            components: [
              {type: 1, components: roleTypeButtons()},
              {type: 1, components: [pronounRoleSelector(i.member.roles)]},
            ],
          },
        };

        await axios.post(`/${i.id}/${i.token}/callback`, h);
      }
    }
  }

  return;
});

app.listen(3000, () => console.log('ready'));

async function manageRoles(
  i: APIGuildInteraction,
  allRoles: {[key: string]: Snowflake}
): Promise<void> {
  const selectedRoles = i.data!.values as (keyof typeof allRoles)[];
  const toAdd = selectedRoles
    .map(r => allRoles[r])
    .filter(r => !i.member.roles.includes(r));

  const toRemove = Object.keys(allRoles)
    .filter(
      (r: keyof typeof allRoles) =>
        i.member.roles.includes(allRoles[r]) && !selectedRoles.includes(r)
    )
    .map(r => allRoles[r]);

  for (const role of toAdd) {
    if (role) {
      await axiosBot.put(
        `/guilds/${i.guild_id}/members/${i.member.user.id}/roles/${role}`
      );
    }
  }

  for (const role of toRemove) {
    if (role) {
      await axiosBot.delete(
        `/guilds/${i.guild_id}/members/${i.member.user.id}/roles/${role}`
      );
    }
  }
}

declare module 'discord-api-types' {
  const enum InteractionType {
    Component = 3,
  }

  interface APIApplicationCommandInteractionData {
    [key: string]: unknown;
  }
}
